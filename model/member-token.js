const db = require('./db');
const TABLE_TOKEN = 'member_token_info';

const MemberToken = {
    /**
     *
     * @param {Snowflake} snowflakes
     * @returns {Promise}
     */
    createMemberTokenInfo: (snowflake) => {
        return db.asyncQuery(`INSERT INTO ${TABLE_TOKEN} (user_id) VALUES (?)`, [snowflake]);
    },

    /**
     *
     * @param {Snowflake} snowflake
     * @returns {Promise}
     */
    getMemberTokenInfo: (snowflake) => {
        return db.asyncQuery(`SELECT user_id, amount, all_time_amount FROM ${TABLE_TOKEN} WHERE user_id = ?`, [snowflake]);
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
                const newCurrentAmount = membersTokenInfo[0].amount + 1;
                const newAllTimeAmount = membersTokenInfo[0].all_time_amount + 1;

                await db.asyncQuery(
                    `UPDATE ${TABLE_TOKEN}
                    SET amount = ?, all_time_amount = ?
                    WHERE user_id = ?`,
                    [newCurrentAmount, newAllTimeAmount, snowflakes[i]]
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
                SELECT user_id, amount
                FROM ${TABLE_TOKEN}
                ${whereClause}
                ORDER BY amount DESC
            `,
            [snowflake]
        );
    },
}

module.exports = MemberToken;
