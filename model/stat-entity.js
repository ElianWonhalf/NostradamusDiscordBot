const Logger = require('@lilywonhalf/pretty-logger');
const Config = require('../config.json');
const connection = require('./db');

class StatEntity
{
    /**
     * @returns {string}
     */
    static get INSERT_QUERY_MODE_FULL() {
        return 'full';
    }

    /**
     * @returns {string}
     */
    static get INSERT_QUERY_MODE_HEAD() {
        return 'head';
    }

    /**
     * @returns {string}
     */
    static get INSERT_QUERY_MODE_TAIL() {
        return 'tail';
    }

    /**
     * @returns {Array<string>}
     */
    static get INSERT_QUERY_MODES() {
        return [
            StatEntity.INSERT_QUERY_MODE_FULL,
            StatEntity.INSERT_QUERY_MODE_HEAD,
            StatEntity.INSERT_QUERY_MODE_TAIL
        ];
    }

    /**
     * @param {string} tableName
     */
    constructor(tableName) {
        this.tableName = tableName;
        this.paused = false;
    }

    /**
     * @returns {string}
     */
    static getCurrentDate(date = null) {
        date = date !== null ? date : new Date();
        const day = date.getDay() === 0 ? 7 : date.getDay();

        return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${day}`;
    }

    async truncate() {
        await connection.asyncQuery(`TRUNCATE TABLE ${this.tableName}`);
    }

    /**
     * @param {string} snowflake
     * @param {string} data
     * @param {object} [extraColumns]
     */
    async save(snowflake, data, extraColumns = null) {
        if (Config.statsEnabled && !this.paused) {
            let updateString = 'data = ?';
            const query = this.getInsertQuery(snowflake, data, extraColumns);

            data = data.toString();

            if (data.startsWith('+')) {
                data = data.substr(1);
                updateString = 'data = data + ?';
            }

            query[1].push(data);
            await connection.asyncQuery(`${query[0]} ON DUPLICATE KEY UPDATE ${updateString}`, query[1]);
        }
    }

    /**
     * @param {string|null} snowflake
     * @param {string|null} data
     * @param {object|null} [extraColumns]
     * @param {string} mode
     */
    getInsertQuery(snowflake, data, extraColumns = null, mode = 'full') {
        let dateObject = null;

        data = data === null ? '' : data.toString();
        mode = StatEntity.INSERT_QUERY_MODES.includes(mode) ? mode : 'full';

        if (extraColumns !== null && extraColumns.hasOwnProperty('date')) {
            dateObject = extraColumns.date;
            delete extraColumns.date;
        }

        const date = this.constructor.getCurrentDate(dateObject);
        const hasExtra = extraColumns !== null && Object.keys(extraColumns).length > 0;
        const extraColumnNames = hasExtra ? Object.keys(extraColumns).join(', ') : null;
        const extraColumnPlaceholders = hasExtra ? new Array(Object.keys(extraColumns).length).fill('?').join(', ') : null;

        if (data.startsWith('+')) {
            data = data.substr(1);
        }

        let values = [snowflake, data, date];

        if (hasExtra) {
            values = values.concat(Object.values(extraColumns))
        }

        const queryHead = `INSERT INTO ${this.tableName} (user_id, data, date${hasExtra ? `, ${extraColumnNames}` : ''}) VALUES`;
        const queryTail = `(?, ?, ?${hasExtra ? `, ${extraColumnPlaceholders}` : ''})`;
        let queryString;

        switch (mode) {
            case StatEntity.INSERT_QUERY_MODE_FULL:
                queryString = `${queryHead}\n${queryTail}`;
                break;

            case StatEntity.INSERT_QUERY_MODE_HEAD:
                queryString = queryHead;
                break;

            case StatEntity.INSERT_QUERY_MODE_TAIL:
                queryString = queryTail;
                break;
        }

        const query = [queryString];

        if ([StatEntity.INSERT_QUERY_MODE_FULL, StatEntity.INSERT_QUERY_MODE_TAIL].includes(mode)) {
            query.push(values);
        }

        return query;
    }

    /**
     * @param {Array} lines
     */
    async bulkSave(lines) {
        const chunkSize = 4000;
        const chunksAmount = Math.ceil(lines.length / chunkSize);
        const queryHead = this.getInsertQuery(null, null, null, StatEntity.INSERT_QUERY_MODE_HEAD);

        Logger.info(`Starting bulk save, executing ${chunksAmount} queries...`);
        this.paused = true;
        this.truncate();

        for (let i = 0; i < chunksAmount && this.paused; i++) {
            const begin = i * chunkSize;
            let data = [];
            const values = lines.slice(begin, begin + chunkSize).map((value) => {
                value.push(StatEntity.INSERT_QUERY_MODE_TAIL);
                const queryData = this.getInsertQuery(...value);
                data = data.concat(queryData[1]);

                return queryData[0];
            });
            const query = `${queryHead}\n${values.join(',\n')}`;

            Logger.info(`Bulk save: executing query ${i + 1}/${chunksAmount}...`);
            saveDebugFile('stat-entity-debug-query.sql', query);
            saveDebugFile('stat-entity-debug-data.json', JSON.stringify(data, null, 4));

            await connection.asyncQuery(query, data).catch(error => {
                Logger.exception(error);
                this.paused = false;
            });
        }

        this.paused = false;
        Logger.info(`Bulk save over.`);
    }
}

module.exports = StatEntity;