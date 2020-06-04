const connection = require('./db');
const StatEntity = require('./stat-entity');

class StatMessages extends StatEntity
{
    constructor()
    {
        super('stat_messages');
    }

    /**
     * @param {string} snowflake
     * @returns {Promise.<int>}
     */
    async getMessageAmount(snowflake)
    {
        const data = await connection.asyncQuery(
            `SELECT SUM(\`data\`) AS amount FROM \`${this.tableName}\` WHERE \`user_id\` = ?`,
            [snowflake]
        );

        return parseInt(data.amount);
    }
}

module.exports = new StatMessages();