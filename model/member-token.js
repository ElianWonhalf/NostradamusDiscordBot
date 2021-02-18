const db = require('./db');
const TABLE_TOKEN = 'member_token_info';

const MemberToken = {
    /**
     *
     * @param {Snowflake} snowflakes
     * @returns {Promise}
     */
    createMemberTokenInfo: (snowflake) => {
        return db.asyncQuery(`INSERT INTO ${TABLE_TOKEN} (user_id, actual_token_amount, total_token_amount) VALUES (${snowflake}, 1, 1)`);
    },

    /**
     *
     * @param {Snowflake} snowflake
     * @returns {Promise}
     */
    getMemberTokenInfo: (snowflake) => {
        return db.asyncQuery(`SELECT user_id, actual_token_amount, total_token_amount FROM ${TABLE_TOKEN} WHERE user_id = '${snowflake}'`);
    },

    /**
     * @param {Array<Snowflake>} snowflakes
     * @returns {Promise}
     */
    add: async (snowflakes) => {
        await db.asyncQuery('SET NAMES utf8mb4');

        for (let i = 0; i < snowflakes.length; i++) {
            let membersTokenInfo = await MemberToken.getMemberTokenInfo(snowflakes[i]);

            if (!membersTokenInfo[0]) {
                MemberToken.createMemberTokenInfo(snowflakes[i]);
            } else {
                const newActualAmount = membersTokenInfo[0].actual_token_amount + 1;
                const newTotalAmount = membersTokenInfo[0].total_token_amount + 1;

                await db.asyncQuery(
                    `UPDATE ${TABLE_TOKEN} SET actual_token_amount = ${newActualAmount}, total_token_amount = ${newTotalAmount} WHERE user_id = ${snowflakes[i]}`
                );
            }
        };
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
                SELECT user_id, actual_token_amount
                FROM ${TABLE_TOKEN}
                ${whereClause}
                ORDER BY actual_token_amount DESC
            `,
            [snowflake]
        );
    },
}

module.exports = MemberToken;
