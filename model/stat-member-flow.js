const connection = require('./db');
const StatEntity = require('./stat-entity');

class StatMemberFlow extends StatEntity
{
    /**
     * @returns {string}
     */
    static get MEMBER_FLOW_EVENT_JOINED()
    {
        return 'joined';
    }

    /**
     * @returns {string}
     */
    static get MEMBER_FLOW_EVENT_LEFT()
    {
        return 'left';
    }

    /**
     * @returns {string}
     */
    static get MEMBER_FLOW_EVENT_VALIDATED()
    {
        return 'validated';
    }

    /**
     * @returns {Array<string>}
     */
    static get MEMBER_FLOW_EVENTS()
    {
        return [
            StatMemberFlow.MEMBER_FLOW_EVENT_JOINED,
            StatMemberFlow.MEMBER_FLOW_EVENT_LEFT,
            StatMemberFlow.MEMBER_FLOW_EVENT_VALIDATED
        ];
    }

    constructor()
    {
        super('stat_member_flow');
    }

    /**
     * @inheritDoc
     */
    async save(snowflake, data, extraColumns = null)
    {
        if (StatMemberFlow.MEMBER_FLOW_EVENTS.includes(data)) {
            super.save(snowflake, data, extraColumns);
        }
    }

    /**
     * @param {string} snowflake
     * @param {string} event
     * @param {boolean} recent
     * @returns {Promise.<int>}
     */
    async getEventAmount(snowflake, event, recent = false)
    {
        if (StatMemberFlow.MEMBER_FLOW_EVENTS.includes(event)) {
            let querySuffix = '';

            if (recent) {
                const twoWeeksAgo = new Date(Date.now() - TWO_WEEKS);
                const twoWeeksAgoString = `${twoWeeksAgo.getFullYear()}-${twoWeeksAgo.getMonth() + 1}-${twoWeeksAgo.getDate()}-0`;

                querySuffix = `AND \`date\` > '${twoWeeksAgoString}'`;
            }

            const data = await connection.asyncQuery(
                `SELECT COUNT(*) AS amount FROM \`${this.tableName}\` WHERE \`user_id\` = ? AND \`data\` = ? ${querySuffix}`,
                [snowflake, event]
            );

            return data.amount === null ? 0 : parseInt(data.amount);
        }
    }

    /**
     * @param {string} snowflake
     * @param {boolean} recent
     * @returns {Promise.<int>}
     */
    getJoinedAmount(snowflake, recent = false)
    {
        return this.getEventAmount(snowflake, StatMemberFlow.MEMBER_FLOW_EVENT_JOINED, recent);
    }

    /**
     * @param {string} snowflake
     * @param {boolean} recent
     * @returns {Promise.<int>}
     */
    getLeftAmount(snowflake, recent = false)
    {
        return this.getEventAmount(snowflake, StatMemberFlow.MEMBER_FLOW_EVENT_LEFT, recent);
    }

    /**
     * @param {string} snowflake
     * @param {boolean} recent
     * @returns {Promise.<int>}
     */
    getValidatedAmount(snowflake, recent = false)
    {
        return this.getEventAmount(snowflake, StatMemberFlow.MEMBER_FLOW_EVENT_VALIDATED, recent);
    }

    /**
     * @param {string} snowflake
     * @param {string} event
     * @returns {Promise.<Date>}
     */
    async getFirstDate(snowflake, event)
    {
        if (StatMemberFlow.MEMBER_FLOW_EVENTS.includes(event)) {
            const date = new Date();
            const data = await connection.asyncQuery(
                `SELECT MIN(\`date\`) AS date FROM \`${this.tableName}\` WHERE \`user_id\` = ? AND \`data\` = ?`,
                [snowflake, event]
            );

            if (data.date !== null) {
                const dateParts = data.date.split('-');

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

        return null;
    }

    /**
     * @param {string} snowflake
     * @returns {Promise.<Date>}
     */
    getFirstJoinedDate(snowflake)
    {
        return this.getFirstDate(snowflake, StatMemberFlow.MEMBER_FLOW_EVENT_JOINED);
    }

    /**
     * @param {string} snowflake
     * @returns {Promise.<Date>}
     */
    getFirstLeftDate(snowflake)
    {
        return this.getFirstDate(snowflake, StatMemberFlow.MEMBER_FLOW_EVENT_LEFT);
    }

    /**
     * @param {string} snowflake
     * @returns {Promise.<Date>}
     */
    getFirstValidatedDate(snowflake)
    {
        return this.getFirstDate(snowflake, StatMemberFlow.MEMBER_FLOW_EVENT_VALIDATED);
    }
}

module.exports = new StatMemberFlow();