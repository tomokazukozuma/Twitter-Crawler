
import config from 'config';
import $ from 'cheerio';
import moment from 'moment';

const dateFormat = config.get('dateFormat');

/**
 * tweet内容をcsv用データに変換
 */
function convert(tweetList) {
    tweetList = tweetList.filter(function(index, tweet) {
        return $(tweet).attr('data-item-type') === 'tweet';
    });
    return tweetList.map(function(index, tweet) {
        const unixTime = $(tweet).find('._timestamp').attr('data-time-ms');
        return {
            accountName: $(tweet).find('.tweet').attr('data-name').replace(/(\\|\")/g, ''),
            screenName: $(tweet).find('.tweet').attr('data-screen-name'),
            accountId: $(tweet).find('.tweet').attr('data-user-id'),
            text: $(tweet).find('.tweet-text').text().trim().replace(/(\\|\")/g, ''),
            tweet_id: $(tweet).find('.tweet').attr('data-tweet-id'),
            tweetUrl: 'https://twitter.com' + $(tweet).find('.tweet').attr('data-permalink-path'),
            replyCount: $(tweet).find('.ProfileTweet-action.ProfileTweet-action--reply .ProfileTweet-actionCountForPresentation').text().replace( /,/g, ''),
            retweetCount: $(tweet).find('.ProfileTweet-actionButton.js-actionButton.js-actionRetweet .ProfileTweet-actionCountForPresentation').text().replace( /,/g, ''),
            favoriteCount: $(tweet).find('.ProfileTweet-actionButton.js-actionButton.js-actionFavorite .ProfileTweet-actionCountForPresentation').text().replace( /,/g, ''),
            tweetDatetime:  moment(new Date(Number(unixTime))).format(dateFormat),
            insertDatetime: moment(new Date()).format(dateFormat),
        };
    }).get();
}

export {convert};
