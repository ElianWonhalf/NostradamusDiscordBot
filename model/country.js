const db = require('./db');

const Country = {
    /** {Array} */
    list: {},

    /**
     * @returns {Promise}
     */
    init: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT friendly, aliases, role FROM countries').on('result', row => {
                Country.list[row.role.toLowerCase()] = row.role;
                Country.list[row.friendly.toLowerCase()] = row.role;

                if (row.aliases !== undefined && row.aliases !== null && row.aliases.length > 0) {
                    row.aliases.split(',').forEach(alias => {
                        if (alias !== null && alias.length > 0) {
                            Country.list[alias] = row.role;
                        }
                    });
                }
            }).on('error', (error) => {
                reject('Error loading countries: ' + error);
            }).on('end', resolve);
        });
    },

    /**
     * @param {string} friendly
     * @param {string} role
     * @returns {Promise}
     */
    add: (friendly, role) => {
        return new Promise((resolve, reject) => {
            Country.list[role.toLowerCase()] = role;
            Country.list[friendly.toLowerCase()] = role;

            db.query('SET NAMES utf8');
            db.query(`INSERT INTO countries (friendly, role) VALUES (?, ?)`, [friendly, role], (error) => {
                error ? reject(error) : resolve();
            });
        });
    },

    /**
     * @param {string} alias
     * @param {string} role
     * @returns {Promise}
     */
    addAlias: (alias, role) => {
        alias = alias.toLowerCase();

        return new Promise((resolve, reject) => {
            if (Country.list.hasOwnProperty(role.toLowerCase())) {
                Country.list[alias] = role;

                db.query('SET NAMES utf8');
                db.query(
                    `UPDATE countries SET aliases = IF(aliases IS NULL, ?, CONCAT(aliases, ',', ?)) WHERE role = ?`,
                    [alias, alias, role],
                    (error) => {
                        error ? reject(error) : resolve();
                    }
                );
            } else {
                reject('That role does not exist. You have to create the role before adding aliases.');
            }
        });
    },

    /**
     * @returns {Array}
     */
    getRoleNameList: () => {
        return Array.from(new Set(Object.values(Country.list)));
    },

    /**
     * @param {string} string
     * @returns {string|null}
     */
    getRoleNameFromString: (string) => {
        let roleName = null;

        if (Country.list.hasOwnProperty(string.toLowerCase()) > -1) {
            roleName = Country.list[string.toLowerCase()];
        }

        return roleName;
    }
};

module.exports = Country;
