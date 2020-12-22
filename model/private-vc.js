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
            db.query('SET NAMES utf8mb4');
            db.query(`INSERT INTO private_vc (channel, requestor) VALUES (?, ?)`, [channel, requestor], (error) => {
                if (error) {
                    reject(error);
                } else {
                    PrivateVC.list[requestor] = channel;
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
            })
        ]).then(async ([privateChannel, waitingRoomChannel]) => {
            await member.voice.setChannel(privateChannel);
            return PrivateVC.add(privateChannel.id, member.id).catch(exception => {
                exception.payload = [ privateChannel, waitingRoomChannel ];
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
        const privateChannel = oldVoiceState.channel;
        const waitingRoomChannel = Guild.discordGuild.channels.cache.find(channel => channel.rawPosition === privateChannel.rawPosition + 1);
        await Promise.all([privateChannel.delete(), waitingRoomChannel.delete()]).then(async () => {
            return PrivateVC.remove(member.id).catch(async exception => {
                Logger.exception(exception);
                await Guild.botChannel.send(trans('model.privateVC.errors.deletionFailed', [privateChannel.id, member.toString()]));
            });
        });
    }
}

module.exports = PrivateVC;
