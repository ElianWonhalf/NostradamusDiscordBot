const db = require('./db');

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
     * @param {Snowflake|null} snowflake
     * @returns {Promise<Array>}
     */
    getCount: async (snowflake = null) => {
        await db.asyncQuery('SET NAMES utf8mb4');

        const whereClause = snowflake === null ? '' : 'WHERE user_id = ?';

        return db.asyncQuery(
            `
                SELECT COUNT(*) AS amount_token, user_id
                FROM member_token
                ${whereClause}
                GROUP BY user_id
                ORDER BY amount_token DESC
            `,
            [snowflake]
        );
    },
}

module.exports = MemberToken;
