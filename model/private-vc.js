const Logger = require('@lilywonhalf/pretty-logger');
const db = require('./db');
const Guild = require('./guild');

const PrivateVC = {
    /** {Object} */
    list: {},

    /**
     * @returns {Promise}
     */
    init: () => {
        return new Promise((resolve, reject) => {
            db.query('SELECT requestor, voice_channel, text_channel FROM private_vc').on('result', row => {
                PrivateVC.list[row.requestor] = [row.voice_channel, row.text_channel];
            }).on('error', (error) => {
                reject(`Error loading private VCs: ${error}`);
            }).on('end', resolve);
        });
    },

    /**
     * @param {string} requestor
     * @param {string} voiceChannel
     * @param {string} textChannel
     * @returns {Promise}
     */
    add: (requestor, voiceChannel, textChannel) => {
        return new Promise((resolve, reject) => {
            db.query('SET NAMES utf8mb4');
            db.query(`INSERT INTO private_vc (requestor, voice_channel, text_channel) VALUES (?, ?, ?)`, [requestor, voiceChannel, textChannel], (error) => {
                if (error) {
                    reject(error);
                } else {
                    PrivateVC.list[requestor] = [voiceChannel, textChannel];
                    resolve();
                }
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

    /**
     * @param {VoiceState} oldVoiceState
     */
    privateVoiceChatRequestHandler: async (oldVoiceState) => {
        const member = oldVoiceState.member;
        await Promise.all([
            member.guild.channels.create(`[Private] ${member.displayName}`, {
                type: 'voice',
                parent: Guild.smallVoiceCategoryChannel,
            }),
            member.guild.channels.create("[Waiting room] ⬆️", {
                type: 'voice',
                parent: Guild.smallVoiceCategoryChannel,
            }),
            member.guild.channels.create(`${member.displayName}`, {
                parent: Guild.smallVoiceCategoryChannel,
            })
        ]).then(async ([voiceChannel, waitingRoomChannel, textChannel]) => {
            await member.voice.setChannel(voiceChannel);
            return PrivateVC.add(member.id, voiceChannel.id, textChannel.id).catch(exception => {
                exception.payload = [ voiceChannel, waitingRoomChannel, textChannel ];
                throw exception;
            });
        }).catch(async (exception) => {
            Logger.exception(exception);
            await Guild.botChannel.send(trans('model.privateVC.errors.creationFailed.mods', [member.toString()]));
            await member.send(trans('model.privateVC.errors.creationFailed.member'));
            await member.voice.setChannel(oldVoiceState.channel);
            await Promise.all(exception.payload.map(channel => channel.delete()));
        });
    },

    /**
     * @param {VoiceState} oldVoiceState
     */
    privateVoiceChatDeletionHandler: async (oldVoiceState) => {
        const member = oldVoiceState.member;
        const channels = PrivateVC.list[member.id].map(id => Guild.discordGuild.channels.cache.find(channel => channel.id === id));
        const waitingRoomChannel = Guild.discordGuild.channels.cache.find(channel => channel.rawPosition === channels[0].rawPosition + 1);
        await Promise.all([channels[0].delete(), waitingRoomChannel.delete(), channels[1].delete()]).then(async () => {
            return PrivateVC.remove(member.id).catch(async exception => {
                Logger.exception(exception);
                await Guild.botChannel.send(trans('model.privateVC.errors.deletionFailed', [privateChannel.id, member.toString()]));
            });
        });
    }
}

module.exports = PrivateVC;
