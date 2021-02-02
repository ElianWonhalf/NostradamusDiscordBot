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

    /**
     * @param {String<Snowflake>|null} snowflake
     * @returns {Promise}
     */
    getCount: async (snowflake = null) => {
        await db.asyncQuery('SET NAMES utf8mb4');

        const clauseWHERE = snowflake === null ? "" : `WHERE user_id = (?) `;
        const arraySnowflake = [snowflake];

        return await db.asyncQuery(
            `SELECT COUNT(*) AS amount_token, user_id FROM member_token ${clauseWHERE}GROUP BY user_id ORDER BY amount_token DESC`,
            arraySnowflake
        );
    },
}

module.exports = MemberToken;
