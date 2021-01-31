const Discord = require('discord.js');
const Logger = require('@lilywonhalf/pretty-logger');
const Config = require('../config.json');
const db = require('./db');
const Guild = require('./guild');

const MemberToken = {
    /**
     * @param {Array<Snowflake>} snowflakes
     * @returns {Promise}
     */
    add: async (snowflakes) => {
        await db.asyncQuery('SET NAMES utf8mb4');

        db.asyncQuery(
            `INSERT INTO member_token (user_id) VALUES ${new Array(snowflakes.length).fill('(?)').join(', ')}`, 
            snowflakes
        );
    },
}

module.exports = MemberToken;
