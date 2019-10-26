const db = require('./db');

const Language = {
    /** {Array} */
    list: [],

    /**
     * @returns {Promise}
     */
    init: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT friendly, role FROM languages').on('result', row => {
                Language.list[row.role.toLowerCase()] = row.role;
                Language.list[row.friendly.toLowerCase()] = row.role;

                if (row.aliases !== undefined && row.aliases !== null && row.aliases.length > 0) {
                    row.aliases.split(',').forEach(alias => {
                        if (alias !== null && alias.length > 0) {
                            Language.list[alias] = row.role;
                        }
                    });
                }
            }).on('error', (error) => {
                reject(`Error loading languages: ${error}`);
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
            Language.list[role.toLowerCase()] = role;
            Language.list[friendly.toLowerCase()] = role;

            db.query('SET NAMES utf8');
            db.query(`INSERT INTO languages (friendly, role) VALUES (?, ?)`, [friendly, role], (error) => {
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
            if (Language.list.hasOwnProperty(role.toLowerCase())) {
                Language.list[alias] = role;

                db.query('SET NAMES utf8');
                db.query(
                    `UPDATE languages SET aliases = IF(aliases IS NULL, ?, CONCAT(aliases, ',', ?)) WHERE role = ? OR friendly = ?`,
                    [alias, alias, role, role],
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
        return Array.from(new Set(Object.values(Language.list)));
    },

    /**
     * @returns {Array}
     */
    getRoleAliasesList: () => {
        return Array.from(new Set(Object.keys(Language.list)));
    },

    /**
     * @param {string} string
     * @returns {string|null}
     */
    getRoleNameFromString: (string) => {
        let roleName = null;

        if (Language.list.hasOwnProperty(string.toLowerCase()) > -1) {
            roleName = Language.list[string.toLowerCase()];
        }

        return roleName;
    }
};

module.exports = Language;
