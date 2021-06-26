const Logger = require('@lilywonhalf/pretty-logger');
const Discord = require('discord.js');
const db = require('./db');
const Guild = require('./guild');

const ONE_HOUR = 60 * 60 * 1000;
const DEFAULT_OBJECT = {
    reason: null,
    lastActive: null,
    timestamp: null,
};

const WatchedMember = {
    /** {Array} */
    list: {},

    /**
     * @returns {Promise}
     */
    init: () => {
        db.query('SELECT id, reason, timestamp FROM watchedMember WHERE active = 1').on('result', row => {
            WatchedMember.list[row.id] = Object.assign({}, DEFAULT_OBJECT);
            WatchedMember.list[row.id].reason = row.reason;
            WatchedMember.list[row.id].timestamp = row.timestamp;
        }).on('error', (error) => {
            Logger.error(`Error loading watched members: ${error}`);
        });
    },

    /**
     * @param {Invite} invite
     */
    inviteCreateHandler: async (invite) => {
        if (WatchedMember.isMemberWatched(invite.inviter.id)) {
            WatchedMember.logEvent(
                await invite.guild.members.fetch(invite.inviter.id),
                trans('model.watchedMember.inviteCreated', [invite.code], 'en')
            );
        }
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

            if (lastActiveNull || lastActiveTooOld) {
                WatchedMember.logEvent(
                    await Guild.discordGuild.members.fetch(message.author),
                    trans('model.watchedMember.active', [message.channel], 'en')
                );
            }

            WatchedMember.list[message.author.id].lastActive = currentTimestamp;
        }
    },

    raiderHandler: async (member) => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        await WatchedMember.add(member.id, `Suspected raid ${year}-${month}-${day}`);
        Guild.watchlistChannel.send(trans('model.watchedMember.raiderHandler', [member.toString()], 'en'));
    },

    voiceStateUpdateHandler: (oldVoiceState, newVoiceState) => {
        if (newVoiceState.channel && WatchedMember.isMemberWatched(oldVoiceState.member.id)) {
            switch (true) {
                case !oldVoiceState.channelID && !!newVoiceState.channelID:
                    WatchedMember.logEvent(
                        newVoiceState.member,
                        trans('model.watchedMember.joinedVocal', [newVoiceState.channel.name], 'en')
                    );
                    break;

                case !!oldVoiceState.channelID && !newVoiceState.channelID:
                    WatchedMember.logEvent(
                        newVoiceState.member,
                        trans('model.watchedMember.leftVocal', [oldVoiceState.channel.name], 'en'),
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
        alertFinished = alertFinished || false;
        WatchedMember.list[member.id].timestamp = parseInt(WatchedMember.list[member.id].timestamp) || Date.now();
        const alertEmoji = alertFinished ? '😌' : '🙀';
        const suffix = member !== null && member.nickname !== null ? ` aka ${member.nickname}` : '';
        const embed = new Discord.MessageEmbed()
            .setAuthor(
                `${member.user.username}#${member.user.discriminator}${suffix}`,
                member.user.displayAvatarURL({ dynamic: true })
            )
            .setTimestamp(WatchedMember.list[member.id].timestamp)
            .setColor(alertFinished ? 0xFF0000 : 0x00FF00)
            .setDescription(`👀 ${member} ${alertEmoji} ${log}`)
            .addField('Watch reason :', WatchedMember.list[member.id].reason);

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
            const now = Date.now();
            WatchedMember.list[id].timestamp = now;

            db.query('SET NAMES utf8mb4');
            db.query(
                `INSERT INTO watchedMember (id, reason, active, timestamp) VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE reason = ?, active = ?, timestamp = ?`,
                [id, reason, 1, now, reason, 1, now],
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
            WatchedMember.list[id].reason = reason;

            db.query('SET NAMES utf8mb4');
            db.query(
                `UPDATE watchedMember SET reason = ? WHERE id = ?`,
                [reason, id],
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

            db.query('SET NAMES utf8mb4');
            db.query(`UPDATE watchedMember SET active = 0 WHERE id = ?`, [id], (error) => {
                error ? reject(error) : resolve();
            });
        });
    }
};

module.exports = WatchedMember;
