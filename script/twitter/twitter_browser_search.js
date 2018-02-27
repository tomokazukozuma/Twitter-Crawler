
import fs from 'fs';
import config from 'config';
import async from 'async';
import moment from 'moment';
import http from 'superagent';
import cheerio from 'cheerio';
import json2csv from 'json2csv';
import {convert} from '~/script/twitter/helper';
import program from 'commander';

program
    .option('-w, --word [word]', 'search word')
    .parse(process.argv);

const keyword = program.word;

const logFileName = 'log/' + keyword + '.csv';

const encode = config.get('encode');
const dateFormat = config.get('dateFormat');
const url = config.get('twitter.api.url');
const csvKeys = config.get('twitter.csvKeys');

let maxPosition;
let lastCreatedAt = moment(new Date()).format(dateFormat);

fs.writeFileSync(logFileName, "\"keyword\",\"accountName\",\"screenName\",\"accountId\",\"text\",\"tweetId\",\"tweetUrl\",\"replyCount\",\"retweetCount\",\"favoriteCount\",\"tweetDatetime\",\"insertDatetime\"" + '\n', encode);

async.waterfall([
    function(callback) {
        // ?f=tweets -> すべてのツイート、つけない場合は話題のツイート
        var request = http['get'](url + 'search?f=tweets');
        request
        .set('Content-Type', 'application/json; charset=utf-8')
        .query({
            vertical: 'default',
            // l: 'ja', // 引っかかる言語の投稿
            q: keyword,
            src: 'typd',
            lang: 'ja'
        })
        .end(function(error, res) {
            if (error) {
                console.log('---- error ----');
                callback(error);
                return;
            }
            const $ = cheerio.load(res.text);
            maxPosition = $('.stream-container').attr('data-max-position');
            tweetToCsv({twitterHtml: res.text});
            callback();
        });
    },
    function(callback) {
        const pastDatetime = moment(new Date()).subtract(30, 'days').format(dateFormat);

        async.whilst(
            function() {
                return pastDatetime < lastCreatedAt;
            },
            function(callback) {
                var request = http['get'](url + 'i/search/timeline');
                request
                .set('Content-Type', 'application/json; charset=utf-8')
                .query({
                    vertical: 'default',
                    q: keyword,
                    src: 'typd',
                    include_available_features: 1,
                    include_entities: 1,
                    lang: 'ja',
                    max_position: maxPosition, // 最後に取得した結果のmin_positionを渡す
                    reset_error_state: false
                })
                .end(function(error, res) {
                    if (error) {
                        console.log('------ error -----');
                        callback(error);
                        return;
                    }
                    const result = JSON.parse(res.text);
                    maxPosition = result.min_position;
console.log('maxPosition: ' + maxPosition);
                    tweetToCsv({twitterHtml: result.items_html});
                    callback();
                });
            },
            function(error) {
                if (error) {
                    callback(error);
                    return;
                }
                setTimeout(function() {
                    callback();
                }, 500);
            }
        );
    }
], function(error) {
    if (error) {
        console.log(error);
        return;
    }
    console.log('-------- finish --------');
});



/**
 * tweet内容をcsvに変換
 */
const tweetToCsv = function(twitterData) {
    const $ = cheerio.load(twitterData.twitterHtml);
    const tweetList = $('li.js-stream-item.stream-item.stream-item');
    console.log('----- tweet length: ' + tweetList.length);

    if (tweetList.length === 0) {
        return;
    }

    const parsedTweetList = convert(tweetList, keyword);

    lastCreatedAt = parsedTweetList[parsedTweetList.length - 1].tweetDatetime;
    console.log(lastCreatedAt)

    let csv = json2csv({data: parsedTweetList, hasCSVColumnTitle: false});
    fs.appendFileSync(logFileName, csv + '\n', encode);

    console.log('----- 書き込み完了 -----');
};
