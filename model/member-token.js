const db = require('./db');

const MemberToken = {
    TABLE_NAME: 'member_token_info',

    /**
     * @param {Snowflake} snowflakes
     * 
     * @returns {Promise}
     */
    createMemberTokenInfo: (snowflake, amount = 1) => {
        return db.asyncQuery(`INSERT INTO ${MemberToken.TABLE_NAME} (user_id, amount, all_time_amount) VALUES (?, ?, ?)`, [snowflake, amount, amount]);
    },

    /**
     * @param {Snowflake} snowflake
     * 
     * @returns {Promise}
     */
    getMemberTokenInfo: (snowflake) => {
        return db.asyncQuery(`SELECT user_id, amount, all_time_amount, amount_used FROM ${MemberToken.TABLE_NAME} WHERE user_id = ?`, [snowflake]);
    },

    /**
     * @param {Array<Snowflake>} snowflakes
     * @param {int} amount
     * 
     * @returns {Promise}
     */
    add: async (snowflakes, addToAllTimeAmount = true, amount = 1) => {
        await db.asyncQuery('SET NAMES utf8mb4');

        for (let i = 0; i < snowflakes.length; i++) {
            let membersTokenInfo = await MemberToken.getMemberTokenInfo(snowflakes[i]);

            if (!membersTokenInfo[0]) {
                MemberToken.createMemberTokenInfo(snowflakes[i], amount);
            } else {
                const newCurrentAmount = membersTokenInfo[0].amount + amount;
                const newAllTimeAmount = addToAllTimeAmount ? membersTokenInfo[0].all_time_amount + amount : membersTokenInfo[0].all_time_amount;

                await db.asyncQuery(
                    `
                        UPDATE ${MemberToken.TABLE_NAME}
                        SET amount = ?, all_time_amount = ?
                        WHERE user_id = ?
                    `,
                    [newCurrentAmount, newAllTimeAmount, snowflakes[i]]
                );
            }
        };
    },

    /**
     * @param {Snowflake} snowflake
     * @param {int} amount
     *
     * @returns {Promise}
     */
    remove: async (snowflake, amount) => {
        await db.asyncQuery('SET NAMES utf8mb4');

        let membersTokenInfo = await MemberToken.getMemberTokenInfo(snowflake);

        if (membersTokenInfo[0] && amount > 0) {
            const newCurrentAmount = membersTokenInfo[0].amount - amount;
            await db.asyncQuery(
                `
                    UPDATE ${MemberToken.TABLE_NAME}
                    SET amount = ?
                    WHERE user_id = ?
                `,
                [newCurrentAmount, snowflake]
            );
        }
    },

    /**
     * @param {Snowflake|null} snowflake
     * 
     * @returns {Promise<Array>}
     */
    getCount: async (snowflake = null) => {
        await db.asyncQuery('SET NAMES utf8mb4');

        const whereClause = snowflake === null ? '' : 'WHERE user_id = ?';

        return db.asyncQuery(
            `
                SELECT user_id, amount
                FROM ${MemberToken.TABLE_NAME}
                ${whereClause}
                ORDER BY amount DESC
            `,
            [snowflake]
        );
    },

    /**
    * @param {Snowflake} snowflake
    * @param {int} amount
    *
    * @returns {Promise}
    */
    hasEnoughTokens: async (snowflake, amount) => {
       await db.asyncQuery('SET NAMES utf8mb4');

       let membersTokenInfo = await MemberToken.getMemberTokenInfo(snowflake);

       if (!membersTokenInfo[0] || !amount || amount < 1) {
           return false;
       }

       if (membersTokenInfo[0].amount - amount < 0) {
           return false;
       }

       return true;
    },

    /**
     * @param {Snowflake} snowflake
     * @param {int} amount
     *
     * @returns {Promise}
     */
    useTokens: async (snowflake, amount) => {
        await db.asyncQuery('SET NAMES utf8mb4');

        let membersTokenInfo = await MemberToken.getMemberTokenInfo(snowflake);

        if (membersTokenInfo[0] && amount > 0) {
            const newCurrentAmount = membersTokenInfo[0].amount - amount;
            const newUsedAmount = membersTokenInfo[0].amount_used + amount;

            await db.asyncQuery(
                `
                    UPDATE ${MemberToken.TABLE_NAME}
                    SET amount = ?, amount_used = ?
                    WHERE user_id = ?
                `,
                [newCurrentAmount, newUsedAmount, snowflake]
            );
        }
    },

    /**
     * @returns {Promise<Array>}
     */
     getUsedTokens: async () => {
        await db.asyncQuery('SET NAMES utf8mb4');

        return db.asyncQuery(
            `
                SELECT user_id, amount_used
                FROM ${MemberToken.TABLE_NAME}
                WHERE amount_used > 0
            `
        );
    },

    /**
     * @param {Snowflake} snowflake
     * 
     * @returns {Promise<Array>}
     */
     getUsedCount: async (snowflake) => {
        await db.asyncQuery('SET NAMES utf8mb4');

        return db.asyncQuery(
            `
                SELECT amount_used
                FROM ${MemberToken.TABLE_NAME}
                WHERE user_id = ?
            `,
            [snowflake]
        );
    },

    /**
     * @param {Snowflake} snowflake
     * @param {int} amount
     *
     * @returns {Promise}
     */
     resetUsedTokens: async () => {
        await db.asyncQuery('SET NAMES utf8mb4');

        await db.asyncQuery(
            `
                UPDATE ${MemberToken.TABLE_NAME}
                SET amount_used = 0
                WHERE amount_used > 0
            `
        );
    },
}

module.exports = MemberToken;
