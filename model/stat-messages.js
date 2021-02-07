const connection = require('./db');
const StatEntity = require('./stat-entity');

class StatMessages extends StatEntity
{
    constructor() {
        super('stat_messages');
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

    /**
     * @param {string} snowflake
     * @returns {Promise.<Date>}
     */
    async getFirstMessageDate(snowflake) {
        const date = new Date();
        const data = await connection.asyncQuery(
            `SELECT MIN(\`date\`) AS date FROM \`${this.tableName}\` WHERE \`user_id\` = ?`,
            [snowflake]
        );

        if (data[0].date !== null) {
            const dateParts = data[0].date.split('-');

            dateParts.pop();
            date.setFullYear(dateParts[0]);
            date.setMonth(parseInt(dateParts[1]) - 1);
            date.setDate(dateParts[2]);
            date.setHours(0);
            date.setMinutes(0);
            date.setSeconds(0);
            date.setMilliseconds(0);

            return date;
        }
    }
}

module.exports = new StatMessages();
