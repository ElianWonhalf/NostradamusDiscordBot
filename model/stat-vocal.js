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

        return data.amount === null ? 0 : parseInt(data.amount);
    }
}

module.exports = new StatVocal();
