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