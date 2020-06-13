const Logger = require('@lilywonhalf/pretty-logger');
const Discord = require('discord.js');
const db = require('./db');
const Guild = require('./guild');

const ONE_HOUR = 60 * 60 * 1000;
const DEFAULT_OBJECT = {
    reason: null,
    lastActive: null,
};

const WatchedMember = {
    /** {Array} */
    list: {},

    /**
     * @returns {Promise}
     */
    init: () => {
        db.query('SELECT id, reason FROM watchedMember WHERE active = 1').on('result', row => {
            WatchedMember.list[row.id] = Object.assign({}, DEFAULT_OBJECT);
            WatchedMember.list[row.id].reason = row.reason;
        }).on('error', (error) => {
            Logger.error(`Error loading watched members: ${error}`);
        });
    },

    /**
     * @param {GuildMember} member
     */
    guildMemberAddHandler: async (member) => {
        if (WatchedMember.isMemberWatched(member.id)) {
            WatchedMember.logEvent(
                member,
                trans('model.watchedMember.joined', [], 'en')
            );
        }
    },

    /**
     * @param {GuildMember} member
     */
    guildMemberRemoveHandler: async (member) => {
        if (WatchedMember.isMemberWatched(member.id)) {
            WatchedMember.logEvent(
                member,
                trans('model.watchedMember.left', [], 'en')
            );
        }
    },

    messageHandler: async (message) => {
        if (WatchedMember.isMemberWatched(message.author.id)) {
            const currentTimestamp = (new Date()).getTime();
            const lastActiveNull = WatchedMember.list[message.author.id].lastActive === null;
            const lastActiveTooOld = currentTimestamp - WatchedMember.list[message.author.id].lastActive >= ONE_HOUR;

            if (lastActiveNull || lastActiveTooOld) {
                WatchedMember.logEvent(
                    await Guild.discordGuild.members.fetch(message.author),
                    trans('model.watchedMember.active', [message.channel], 'en')
                );
            }

            WatchedMember.list[message.author.id].lastActive = currentTimestamp;
        }
    },

    voiceStateUpdateHandler: (oldMember, newMember) => {
        if (WatchedMember.isMemberWatched(oldMember.id)) {
            switch (true) {
                case oldMember.voice.channel === null && newMember.voice.channel !== null:
                    WatchedMember.logEvent(
                        newMember,
                        trans('model.watchedMember.joinedVocal', [newMember.voice.channel.name], 'en')
                    );
                    break;

                case oldMember.voice.channel !== null && newMember.voice.channel === null:
                    WatchedMember.logEvent(
                        newMember,
                        trans('model.watchedMember.leftVocal', [oldMember.voice.channel.name], 'en'),
                        true
                    );
                    break;
            }
        }
    },

    /**
     * @param {GuildMember} member
     * @param {String} log
     * @param {boolean} [alertFinished]
     * @returns {Promise.<void>}
     */
    logEvent: async (member, log, alertFinished) => {
        alertFinished = alertFinished || false;

        const alertEmoji = alertFinished ? '😌' : '🙀';
        const suffix = member !== null && member.nickname !== null ? ` aka ${member.nickname}` : '';
        const embed = new Discord.MessageEmbed()
            .setAuthor(
                `${member.user.username}#${member.user.discriminator}${suffix}`,
                member.user.displayAvatarURL({ dynamic: true })
            )
            .setColor(0x00FF00)
            .setDescription(`👀 ${member} ${alertEmoji} ${log}`)
            .setFooter(WatchedMember.list[member.id].reason);

        Guild.watchlistChannel.send(embed);
    },

    /**
     * @param {String} id
     * @returns {boolean}
     */
    isMemberWatched: (id) => {
        id = bot.users.resolveID(id);

        return WatchedMember.list.hasOwnProperty(id);
    },

    /**
     * @param {string} id
     * @param {string} reason
     * @returns {Promise}
     */
    add: (id, reason) => {
        return new Promise((resolve, reject) => {
            WatchedMember.list[id] = Object.assign({}, DEFAULT_OBJECT);
            WatchedMember.list[id].reason = reason;

            db.query('SET NAMES utf8');
            db.query(
                `INSERT INTO watchedMember (id, reason, active) VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE reason = ?, active = ?`,
                [id, reason, 1, reason, 1],
                error => error ? reject(error) : resolve()
            );
        });
    },

    /**
     * @param {string} id
     * @param {string} reason
     * @returns {Promise}
     */
    edit: (id, reason) => {
        return new Promise((resolve, reject) => {
            WatchedMember.list[id] = Object.assign({}, DEFAULT_OBJECT);
            WatchedMember.list[id].reason = reason;

            db.query('SET NAMES utf8');
            db.query(
                `UPDATE watchedMember SET reason = ? WHERE id = ?`,
                [reason, id, 1],
                error => error ? reject(error) : resolve()
            );
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
