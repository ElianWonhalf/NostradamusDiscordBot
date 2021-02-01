const connection = require('./db');
const StatEntity = require('./stat-entity');

class StatFullBlacklistTriggers extends StatEntity
{
    constructor() {
        super('stat_full_blacklist_triggers');
    }

    /**
     * @param {string} snowflake
     * @param {boolean} recent
     * @returns {Promise.<int>}
     */
    async getAmount(snowflake, recent = false) {
        let querySuffix = '';

        if (recent) {
            const twoWeeksAgo = new Date(Date.now() - TWO_WEEKS);
            const twoWeeksAgoString = `${twoWeeksAgo.getFullYear()}-${twoWeeksAgo.getMonth() + 1}-${twoWeeksAgo.getDate()}-0`;

            querySuffix = `AND \`date\` > '${twoWeeksAgoString}'`;
        }

        const data = await connection.asyncQuery(
            `SELECT SUM(\`data\`) AS amount FROM \`${this.tableName}\` WHERE \`user_id\` = ? ${querySuffix}`,
            [snowflake]
        );

        return data[0].amount === null ? 0 : parseInt(data[0].amount);
    }
}

module.exports = new StatFullBlacklistTriggers();
