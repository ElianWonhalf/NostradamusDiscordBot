const db = require('./db');

const PrivateVC = {
    /** {Object} */
    list: {},

    /**
     * @returns {Promise}
     */
    init: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT channel, requestor FROM private_vc').on('result', row => {
                PrivateVC.list[row.requestor] = row.channel;
            }).on('error', (error) => {
                reject(`Error loading private VCs: ${error}`);
            }).on('end', resolve);
        });
    },

    /**
     * @param {string} channel
     * @param {string} requestor
     * @returns {Promise}
     */
    add: (channel, requestor) => {
        return new Promise((resolve, reject) => {
            PrivateVC.list[requestor] = channel;

            db.query('SET NAMES utf8mb4');
            db.query(`INSERT INTO private_vc (channel, requestor) VALUES (?, ?)`, [channel, requestor], (error) => {
                error ? reject(error) : resolve();
            });
        });
    },

    /**
     * @param {string} requestor
     * @returns {Promise}
     */
    remove: (requestor) => {
        return new Promise((resolve, reject) => {
            db.query(`DELETE FROM private_vc WHERE requestor=?`, [requestor], (error) => {
                if (error) {
                    reject(error);
                } else {
                    delete PrivateVC.list[requestor];
                    resolve();
                }
            });
        });
    },

    /**
     * @returns {Array}
     */
    getPrivateChannelsList: () => {
        return Array.from(new Set(Object.values(PrivateVC.list)));
    },
}

module.exports = PrivateVC;