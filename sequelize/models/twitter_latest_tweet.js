'use strict';
module.exports = function(sequelize, DataTypes) {
    var twitter_latest_tweet = sequelize.define('twitter_latest_tweet', {
        id: {
            type: DataTypes.INTEGER,
            field: 'id',
            primaryKey: true
        },
        keyword: {
            type: DataTypes.STRING
        },
        tweetId: {
            type: DataTypes.STRING,
            field: 'tweet_id'
        },
        createdAt: {
            type: DataTypes.DATE,
            field: 'created_at'
        },
        updatedAt: {
            type: DataTypes.DATE,
            field: 'updated_at'
        },
        deleteFlag: {
            type: DataTypes.BOOLEAN,
            field: 'delete_flag'
        }
    }, {
        underscored: true,
        freezeTableName: true,
        classMethods: {
            // associations can be defined here
            associate: function(models) {
            }
        }
    });
    return twitter_latest_tweet;
};