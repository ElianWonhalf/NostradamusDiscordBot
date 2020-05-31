const MySQL = require('mysql');
const Config = require('../config.json');

// http://stackoverflow.com/questions/18496540/node-js-mysql-connection-pooling
const pool = MySQL.createPool(Config.db);

const connection = {
    query: function ()
    {
        const queryArgs = Array.prototype.slice.call(arguments),
            events = [],
            eventNameIndex = {};

        pool.getConnection(function (err, conn) {
            if (err) {
                if (eventNameIndex.error) {
                    eventNameIndex.error();
                }
            }
            if (conn) {
                const q = conn.query.apply(conn, queryArgs);
                q.on('end', function () {
                    conn.release();
                });

                events.forEach(function (args) {
                    q.on.apply(q, args);
                });
            }
        });

        return {
            on: function (eventName, callback) {
                events.push(Array.prototype.slice.call(arguments));
                eventNameIndex[eventName] = callback;
                return this;
            }
        };
    },

    asyncQuery: function ()
    {
        const queryArgs = Array.prototype.slice.call(arguments);

        return new Promise((resolve, reject) => {
            this.query(...queryArgs).on('end', resolve).on('error', reject);
        });
    }
};

module.exports = connection;