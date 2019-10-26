const Logger = require('@elian-wonhalf/pretty-logger');
const db = require('./db');
const Guild = require('./guild');

const DEFAULT_OBJECT = {
    postedInMetaNotified: false,
};

const WatchedMember = {
    /** {Array} */
    list: [],

    /**
     * @returns {Promise}
     */
    init: () => {
        db.query('SELECT id FROM watchedMember WHERE active = 1').on('result', row => {
            WatchedMember.list[row.id] = Object.assign({}, DEFAULT_OBJECT);
        }).on('error', (error) => {
            Logger.error(`Error loading watched members: ${error}`);
        });

        WatchedMember.bindEvents();
    },

    bindEvents: () => {
        bot.on('voiceStateUpdate', (oldMember, newMember) => {
            if (WatchedMember.isMemberWatched(oldMember.id)) {
                WatchedMember.voiceStateUpdateHandler(oldMember, newMember);
            }
        });
    },

    voiceStateUpdateHandler: (oldMember, newMember) => {
        switch (true) {
            case oldMember.voiceChannelID === null && newMember.voiceChannelID !== null:
                WatchedMember.logEvent(
                    newMember,
                    trans('model.watchedMember.joinedVocal', [newMember.voiceChannel.name], 'en')
                );
                break;

            case oldMember.voiceChannelID !== null && newMember.voiceChannelID === null:
                WatchedMember.logEvent(
                    newMember,
                    trans('model.watchedMember.leftVocal', [oldMember.voiceChannel.name], 'en'),
                    true
                );
                break;
        }
    },

    logEvent: (member, log, alertFinished) => {
        alertFinished = alertFinished || false;
        const alertEmoji = alertFinished ? '😌' : '🙀';

        Guild.botChannel.send(`👀 ${member} ${alertEmoji}\n${log}`);
    },

    /**
     * @param {String} id
     * @returns {boolean}
     */
    isMemberWatched: (id) => {
        id = bot.resolver.resolveUserID(id);
        return WatchedMember.list.hasOwnProperty(id);
    },

    /**
     * @param {string} id
     * @returns {Promise}
     */
    add: (id) => {
        return new Promise((resolve, reject) => {
            WatchedMember.list[id] = Object.assign({}, DEFAULT_OBJECT);

            db.query('SET NAMES utf8');
            db.query(`INSERT INTO watchedMember (id, active) VALUES (?, ?)`, [id, 1], (error) => {
                error ? reject(error) : resolve();
            });
        });
    },

    /**
     * @param {string} id
     * @returns {Promise}
     */
    remove: (id) => {
        return new Promise((resolve, reject) => {
            if (WatchedMember.list.hasOwnProperty(id)) {
                delete WatchedMember.list[id];
            }

            db.query('SET NAMES utf8');
            db.query(`UPDATE watchedMember SET active = 0 WHERE id = ?`, [id], (error) => {
                error ? reject(error) : resolve();
            });
        });
    }
};

module.exports = WatchedMember;
