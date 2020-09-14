const connection = require('./db');
const StatEntity = require('./stat-entity');

class StatProfileChange extends StatEntity
{
    static get TYPE_NICKNAME() {
        return 'nickname';
    }

    static get TYPE_USERNAME() {
        return 'username';
    }

    static get TYPE_AVATAR() {
        return 'avatar';
    }

    static get TYPES() {
        return [
            StatProfileChange.TYPE_NICKNAME,
            StatProfileChange.TYPE_USERNAME,
            StatProfileChange.TYPE_AVATAR
        ];
    }

    constructor() {
        super('stat_profile_change');
    }

    /**
     * @param {string} snowflake
     * @param {string} type
     * @returns {Promise.<Array<string>>}
     */
    async getDataList(snowflake, type) {
        if (StatProfileChange.TYPES.includes(type)) {
            let data = await connection.asyncQuery(
                `SELECT \`data\` FROM \`${this.tableName}\` WHERE \`user_id\` = ? AND type = ?`,
                [snowflake, type]
            );

            if (data !== undefined && !Array.isArray(data)) {
                data = [data];
            }

            return data === undefined ? [] : data.map(datum => datum.data);
        }
    }

    /**
     * @param {string} snowflake
     * @param {string} type
     * @returns {Promise.<int>}
     */
    async getDataCount(snowflake, type) {
        if (StatProfileChange.TYPES.includes(type)) {
            let data = await connection.asyncQuery(
                `SELECT COUNT(*) AS \`count\` FROM \`${this.tableName}\` WHERE \`user_id\` = ? AND type = ?`,
                [snowflake, type]
            );

            if (data !== undefined && Array.isArray(data)) {
                data = data[0];
            }

            return typeof data === 'undefined' || typeof data.count === 'undefined' ? 0 : data.count;
        }
    }

    /**
     * @param {Snowflake} snowflake
     * @returns {Promise.<Array<string>>}
     */
    async getUsernameList(snowflake) {
        return this.getDataList(snowflake, StatProfileChange.TYPE_USERNAME);
    }

    /**
     * @param {Snowflake} snowflake
     * @returns {Promise.<Array<string>>}
     */
    async getNicknameList(snowflake) {
        return this.getDataList(snowflake, StatProfileChange.TYPE_NICKNAME);
    }

    /**
     * @param {Snowflake} snowflake
     * @returns {Promise.<Array<string>>}
     */
    async getAvatarList(snowflake) {
        return this.getDataList(snowflake, StatProfileChange.TYPE_AVATAR);
    }

    /**
     * @param {Snowflake} snowflake
     * @returns {Promise.<int>}
     */
    async getUsernameCount(snowflake) {
        return this.getDataCount(snowflake, StatProfileChange.TYPE_USERNAME);
    }

    /**
     * @param {Snowflake} snowflake
     * @returns {Promise.<int>}
     */
    async getNicknameCount(snowflake) {
        return this.getDataCount(snowflake, StatProfileChange.TYPE_NICKNAME);
    }

    /**
     * @param {Snowflake} snowflake
     * @returns {Promise.<int>}
     */
    async getAvatarCount(snowflake) {
        return this.getDataCount(snowflake, StatProfileChange.TYPE_AVATAR);
    }
}

module.exports = new StatProfileChange();