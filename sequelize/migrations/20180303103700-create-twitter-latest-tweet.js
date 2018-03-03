'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('twitter_latest_tweet', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            keyword: {
                allowNull: false,
                type: Sequelize.STRING
            },
            tweet_id: {
                allowNull: false,
                type: Sequelize.STRING
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE
            },
            delete_flag: {
                allowNull: false,
                defaultValue: false,
                type: Sequelize.BOOLEAN
            }
        });
    },
    down: function(queryInterface, Sequelize) {
        return queryInterface.dropTable('twitter_latest_tweet');
    }
};