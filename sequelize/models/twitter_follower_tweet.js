'use strict';
module.exports = function(sequelize, DataTypes) {
    var twitter_follower_tweet = sequelize.define('twitter_follower_tweet', {
        id: {
            type: DataTypes.INTEGER,
            field: 'id',
            primaryKey: true
        },
        accountName: {
            type: DataTypes.STRING,
            field: 'account_name'
        },
        accountId: {
            type: DataTypes.STRING,
            field: 'account_id'
        },
        screenName: {
            type: DataTypes.STRING,
            field: 'screen_name'
        },
        text: {
            type: DataTypes.STRING(1000),
            field: 'text'
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
    return twitter_follower_tweet;
};