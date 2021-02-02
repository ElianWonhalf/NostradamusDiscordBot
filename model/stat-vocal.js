const connection = require('./db');
const StatEntity = require('./stat-entity');

class StatVocal extends StatEntity
{
    constructor() {
        super('stat_vocal');
    }

    /**
     * @param {string} snowflake
     * @returns {Promise.<int>}
     */
    async getAmount(snowflake) {
        const data = await connection.asyncQuery(
            `SELECT SUM(\`data\`) AS amount FROM \`${this.tableName}\` WHERE \`user_id\` = ?`,
            [snowflake]
        );

        return data[0].amount === null ? 0 : parseInt(data[0].amount);
    }
}

module.exports = new StatVocal();
