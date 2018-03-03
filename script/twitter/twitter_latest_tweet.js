
import 'dotenv/config';
import config from 'config';
import async from 'async';
import moment from 'moment';
import http from 'superagent';
import cheerio from 'cheerio';
import json2csv from 'json2csv';
import program from 'commander';
import AWS from 'aws-sdk';
import {convert} from '~/script/twitter/helper';
import { twitter_latest_tweet as TwitterLatestTweet } from '~/sequelize/models/index';

program
    .option('-w, --word [word]', 'search word')
    .option('-l, --lang [language]', 'target language')
    .parse(process.argv);

const keyword = program.word;
const language = program.lang || 'ja';

const firehose = new AWS.Firehose({
    apiVersion: '2015-08-04',
    endpoint: config.get('AWS.firehose.endpoint'),
    region: config.get('AWS.firehose.region')
});

async.waterfall([
    function(callback) {
        async.parallel({
            // スクレイピング
            tweetList: function(callback) {
                // ?f=tweets -> すべてのツイート、つけない場合は話題のツイート
                var request = http['get'](config.get('twitter.api.url') + 'search?f=tweets');
                request
                .set('Content-Type', 'application/json; charset=utf-8')
                .query({
                    vertical: 'default',
                    l: language, // 引っかかる言語の投稿
                    q: keyword,
                    src: 'typd',
                    // lang: 'ja' // アカウントの言語なのでスクレイピングでは関係ない
                })
                .end(function(error, res) {
                    if (error) {
                        console.log('---- error ----');
                        callback(error);
                        return;
                    }
                    let tweetList = htmlConvertToTweetList({twitterHtml: res.text});
                    callback(null, tweetList);
                });
            },
            // DBから最新のtweetを取得
            latestTweet: function(callback) {
                TwitterLatestTweet.findOne({
                    where: {
                        keyWord: keyword
                    },
                    order: [ ['id', 'DESC']]
                })
                .then(twittreLatestTweet => {
                    callback(null, twittreLatestTweet)
                });
            }
        }, callback);
    },
    // firehoseに投げる
    function(result, callback) {
        // tweetが取得できない場合
        if (result.tweetList.length === 0) {
            callback();
            return;
        }
        // DBにある最新のtweetよりも新しいものを抽出
        let latestTweetList
        if (result.latestTweet) {
            latestTweetList = result.tweetList.filter(tweet => Number(tweet.tweetId) > Number(result.latestTweet.tweetId));
        } else {
            latestTweetList = result.tweetList
        }
        
        // 最新のtweetがない場合
        if (latestTweetList.length === 0) {
            callback();
            return;
        }

        async.parallel({
            // firehoseに投げる
            firehose: function(callback) {
                let csv = json2csv({data: latestTweetList, hasCSVColumnTitle: false}) + '\n';
                firehose.putRecord({
                    DeliveryStreamName: config.get('AWS.firehose.DeliveryStreamName'),
                    Record: {
                        Data: csv
                    }
                }, function(error, result) {
                    if (error) {
                        callback(error);
                        return;
                    }
                    callback();
                });
            },
            // 最新のtweetデータをDBに登録
            create: function(callback) {
                TwitterLatestTweet.create(latestTweetList[0])
                .then(result => {
                    callback();
                });
            }
        }, callback);
    }
], function(error) {
    if (error) {
        console.log(error);
    }
    console.log('-------- finish --------');
    process.exit()
});


/**
 * tweet内容をcsvに変換
 */
const htmlConvertToTweetList = function(twitterData) {
    const $ = cheerio.load(twitterData.twitterHtml);
    const tweetList = $('li.js-stream-item.stream-item.stream-item');
    console.log('----- tweet length: ' + tweetList.length);

    if (tweetList.length === 0) {
        return [];
    }

    return convert(tweetList, keyword);   
};
