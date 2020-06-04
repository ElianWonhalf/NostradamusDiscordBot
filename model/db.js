const MySQL = require('mysql');
const Config = require('../config.json');

// http://stackoverflow.com/questions/18496540/node-js-mysql-connection-pooling
const pool = MySQL.createPool(Config.db);

const connection = {
    queue: [],
    processingQueue: false,

    query: function ()
    {
        const args = Array.prototype.slice.call(arguments);
        const events = [];
        const eventNameIndex = {};

        connection.queue.push({
            args,
            events,
            eventNameIndex
        });

        if (!connection.processingQueue) {
            connection.processQueue();
        }

        return {
            on: function (eventName, callback) {
                events.push(Array.prototype.slice.call(arguments));
                eventNameIndex[eventName] = callback;
                return this;
            }
        };
    },

    execute: function ()
    {
        return new Promise((resolve, reject) => {
            const query = connection.queue.shift();
            const queryArgs = query.args;
            const events = query.events;
            const eventNameIndex = query.eventNameIndex;

            pool.getConnection(function (err, conn) {
                if (err) {
                    if (eventNameIndex.error) {
                        eventNameIndex.error();
                    }

                    reject();
                }
                if (conn) {
                    const q = conn.query.apply(conn, queryArgs);
                    q.on('end', function () {
                        conn.release();
                        resolve();
                    });

                    events.forEach(function (args) {
                        q.on.apply(q, args);
                    });
                }
            });
        });
    },

    asyncQuery: function ()
    {
        const queryArgs = Array.prototype.slice.call(arguments);

        return new Promise((resolve, reject) => {
            this.query(...queryArgs).on('result', resolve).on('error', reject);
        });
    },

    processQueue: async function ()
    {
        connection.processingQueue = true;

        while (connection.queue.length > 0) {
            await connection.execute();
        }

        connection.processingQueue = false;
    }
};

module.exports = connection;