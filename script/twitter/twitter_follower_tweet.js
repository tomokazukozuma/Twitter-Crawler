
import 'dotenv/config';
import moment from 'moment';
import async from 'async';
import config from 'config';
import Twitter from 'twitter';
import { twitter_follower as twitterFollower } from '~/sequelize/models/index';
import { twitter_follower_tweet as twitterFollowerTwitter } from '~/sequelize/models/index';

const client = new Twitter({
    consumer_key: config.get('twitter.consumerKey'),
    consumer_secret: config.get('twitter.consumerSecret'),
    access_token_key: config.get('twitter.accessTokenKey'),
    access_token_secret: config.get('twitter.accessTokenSecret')
});

const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const timezoneOffset = 9 * 60 * 60 * 1000; // Asia/Tokyo
const limitDatetime = Date.now() - 30 * 24 * 60 * 60 * 1000; // A Month Period

const count = 200;
let user;

async.doWhilst(
    function(callback) {
        async.waterfall([
            function(callback) {
                twitterFollower.findOne({
                    where: {
                        completeFlag: false
                    }
                })
                .then(result => {
                    user = result;
                    callback();
                });
            },
            function(callback) {
                if (!user) {
                    callback();
                    return;
                }
                getTweetList(user, callback);
            }
        ], function(error) {
            if (error) {
                callback(error);
                return;
            }
            callback();
        });
    },
    function() {
        return  user;
    },
    function(error) {
        if (error) {
            console.log(error);
            return;
        }
        console.log('------ finish ------');
        process.exit();
    }
);


const getTweetList = function(user, callback) {

    var tweetList = [];
    var maxId = null;
    var continueFlag;

    async.doWhilst(
        function(callback) {

            var params = {
                screen_name: user.screenName,
                count: count,
                exclude_replies: true,
                include_rts: false
            };

            if (maxId) {
                params.max_id = maxId;
            }

            async.waterfall([
                function(callback) {
                    client.get('statuses/user_timeline', params, function(error, result) {
                        if (error && error.message === 'HTTP Error: 401 Authorization Required') {
                            console.log('---- secret user ----');
                            callback();
                            return;
                        }
                        if (Array.isArray(error) && error[0].message === 'Sorry, that page does not exist.') {
                            console.log('---- not found user ----');
                            callback();
                            return;
                        }
                        if (error) {
                            callback(error);
                            return;
                        }
                        
                        // When max_id is specified, tweets of max_id can also be acquired, so remove them here.
                        if (maxId) {
                            result = result.slice(1);
                        }

                        tweetList = result
                        // Acquire only those within the specified period.
                        .filter(tweet => {
                            return new Date(new Date(tweet.created_at).getTime() + timezoneOffset) >= limitDatetime;
                        })
                        .map(tweet => {
                            return {
                                accountName: tweet.user.name,
                                accountId: tweet.user.id_str,
                                screenName: tweet.user.screen_name,
                                description: tweet.user.description,
                                text: tweet.text,
                                createdAt: moment(new Date(new Date(tweet.created_at).getTime() + timezoneOffset)).format(dateFormat)
                            };
                        });

                        continueFlag = result.length !== 0 && result.length === tweetList.length;
                        maxId = continueFlag ? result[result.length -1].id : null;

                        callback();
                    });
                },
                // tUpdate Database
                function(callback) {
                    if (tweetList.length === 0) {
                        setTimeout(() => {
                            callback();
                        }, 2 * 1000);
                        return;
                    }
                    twitterFollowerTwitter.bulkCreate(tweetList)
                    .then(() => {
                        setTimeout(() => {
                            callback();
                        }, 2 * 1000);
                    });
                }
            ], callback);
        },
        // Continue to acquire same user's tweet only if tweetList is the same as count
        function() {
            return continueFlag;
        },
        // Update completeFlag
        function(error) {
            if (error) {
                callback(error);
                return;
            }
            if (!user) {
                callback(null, null);
                return;
            }

            twitterFollower.update(
                {
                    completeFlag: true
                },
                {
                    where: {id: user.id}
                }
            )
            .then(result => {
                callback();
            });
        }
    );
};
