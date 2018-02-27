
import config from 'config';
import $ from 'cheerio';
import moment from 'moment';

const dateFormat = config.get('dateFormat');

/**
 * tweet内容をcsv用データに変換
 */
function convert(tweetList, keyword) {
    tweetList = tweetList.filter(function(index, tweet) {
        return $(tweet).attr('data-item-type') === 'tweet';
    });
    return tweetList.map(function(index, tweet) {
        const unixTime = $(tweet).find('._timestamp').attr('data-time-ms');
        const replyCount = $(tweet).find('.ProfileTweet-action.ProfileTweet-action--reply .ProfileTweet-actionCountForPresentation').text().replace( /,/g, '');
        const retweetCount = $(tweet).find('.ProfileTweet-actionButton.js-actionButton.js-actionRetweet .ProfileTweet-actionCountForPresentation').text().replace( /,/g, '');
        const favoriteCount = $(tweet).find('.ProfileTweet-actionButton.js-actionButton.js-actionFavorite .ProfileTweet-actionCountForPresentation').text().replace( /,/g, '');
        return {
            keyword: keyword,
            accountName: $(tweet).find('.tweet').attr('data-name').replace(/(\\|\")/g, ''),
            screenName: $(tweet).find('.tweet').attr('data-screen-name'),
            accountId: $(tweet).find('.tweet').attr('data-user-id'),
            text: $(tweet).find('.tweet-text').text().trim().replace(/(\\|\")/g, ''),
            tweet_id: $(tweet).find('.tweet').attr('data-tweet-id'),
            replyCount: replyCount === '' ? 0 : Number(replyCount),
            retweetCount: retweetCount === '' ? 0 : Number(replyCount),
            favoriteCount: favoriteCount === '' ? 0 : Number(replyCount),
            tweetDatetime:  moment(new Date(Number(unixTime))).format(dateFormat),
            retrieveDatetime: moment(new Date()).format(dateFormat),
        };
    }).get();
}

export {convert};
