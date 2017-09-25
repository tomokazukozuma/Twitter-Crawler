
import 'dotenv/config';
import async from 'async';
import config from 'config';
import program from 'commander';
import Twitter from 'twitter';
import { twitter_follower as twitterFollower } from '~/sequelize/models/index';

const client = new Twitter({
    consumer_key: config.get('twitter.consumerKey'),
    consumer_secret: config.get('twitter.consumerSecret'),
    access_token_key: config.get('twitter.accessTokenKey'),
    access_token_secret: config.get('twitter.accessTokenSecret')
});

program
    .option('-s, --screenName [screenName]', 'screenName')
    .parse(process.argv);

const screenName = program.screenName;

const count = 200;
const totalCount = 1000;
let roopCount = 0;

let params = {
    screen_name: screenName,
    count: count
};

let userList;
async.doWhilst(
    function(callback) {
        roopCount++;
        async.waterfall([
            function(callback) {
                client.get('followers/list', params, function(error, result) {
                    if (error) {
                        callback(error);
                        return;
                    }

                    userList = result.users.map(user => {
                        return {
                            accountName: user.name,
                            accountId: user.id_str,
                            screenName: user.screen_name,
                            description: user.description
                        };
                    });
                    params.cursor = result.next_cursor;
                    callback();
                });
            },
            // Update Database
            function(callback) {
                twitterFollower.bulkCreate(userList)
                .then(() => {
                    callback();
                });
            }
        ], function(error) {
            if (error) {
                callback(error);
                return;
            }
            console.log('totalCount: ' + count * roopCount);
            setTimeout(() => {
                callback();
            }, 60 * 1000);
        });
    },
    function() {
        return  userList.length == 200 && count * roopCount < totalCount;
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
