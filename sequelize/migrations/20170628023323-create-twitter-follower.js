'use strict';
module.exports = {
    up: function(queryInterface, Sequelize) {
        return queryInterface.createTable('twitter_follower', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            account_name: {
                allowNull: false,
                type: Sequelize.STRING
            },
            account_id: {
                allowNull: false,
                type: Sequelize.STRING
            },
            screen_name: {
                allowNull: false,
                type: Sequelize.STRING
            },
            complete_flag: {
                allowNull: false,
                defaultValue: false,
                type: Sequelize.BOOLEAN
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
        return queryInterface.dropTable('twitter_follower');
    }
};