const Discord = require('discord.js');
const Logger = require('@lilywonhalf/pretty-logger');
const Config = require('../config.json');
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
            db.query('SELECT requestor, text_channel, voice_channel, waiting_channel FROM private_vc').on('result', row => {
                PrivateVC.list[row.requestor] = [row.text_channel, row.voice_channel, row.waiting_channel];
            }).on('error', (error) => {
                reject(`Error loading private VCs: ${error}`);
            }).on('end', resolve);
        });
    },

    /**
     * @param {string} requestor
     * @param {string} textChannel
     * @param {string} voiceChannel
     * @param {string} waitingChannel
     * @returns {Promise}
     */
    add: (requestor, textChannel, voiceChannel, waitingChannel) => {
        return new Promise((resolve, reject) => {
            db.query('SET NAMES utf8mb4');
            db.query(`INSERT INTO private_vc (requestor, text_channel, voice_channel, waiting_channel) VALUES (?, ?, ?, ?)`, [requestor, textChannel, voiceChannel, waitingChannel], (error) => {
                if (error) {
                    reject(error);
                } else {
                    PrivateVC.list[requestor] = [textChannel, voiceChannel, waitingChannel];
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
     * @param {string} requestor
     * @returns {Promise}
     */
    makePublic: (requestor) => {
        return new Promise((resolve, reject) => {
            db.query(`UPDATE private_vc SET waiting_channel=NULL WHERE requestor=?`, [requestor], (error) => {
                if (error) {
                    reject(error);
                } else {
                    PrivateVC.list[requestor][2] = null;
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
     * @param {MessageReaction} reaction
     * @param {User} user
     */
    handleReaction: async (reaction, user) => {
        const channelIDs = PrivateVC.list[user.id];
        const message = reaction.message;
        const hasSingleEmbed = message.embeds.length === 1;
        const isByMe = message.author.id === bot.user.id;
        const requestorReacted = user.id !== bot.user.id && channelIDs !== undefined && channelIDs[0] === message.channel.id;
        const validReactionEmojis = ['🔓', '🔒', 'pollyes', 'pollno'];

        if (hasSingleEmbed && isByMe && requestorReacted && validReactionEmojis.includes(reaction.emoji.name)) {
            const channels = channelIDs.map(id => Guild.discordGuild.channels.cache.find(channel => channel.id === id));

            await message.delete();

            if (['pollyes', 'pollno'].includes(reaction.emoji.name)) { // Let member knocking on door in or not?
                const guestMember = await Guild.getMemberFromMention(message.embeds[0].description);
                if (guestMember === null) {
                    await channels[0].send(trans('model.privateVC.errors.memberNotFound'));
                } else {
                    await guestMember.voice.setChannel(reaction.emoji.name === 'pollyes' ? channels[1] : null);
                }
                return;
            } else if (reaction.emoji.name === '🔓') { // Make channel public or not?
                const newVoiceChannelName = channels[1].name.replace('[Private] ', '');

                await channels[2].delete();
                channels.pop();

                await channels.forEach(channel => channel.lockPermissions());
                await channels[1].setName(newVoiceChannelName);

                await PrivateVC.makePublic(user.id).catch(async exception => {
                    Logger.exception(exception);
                    await Guild.botChannel.send(trans('model.privateVC.errors.modificationFailed.mods', [user.toString()]));
                    await user.send(trans('model.privateVC.errors.modificationFailed.member'));
                    channels.forEach(async channel => await channel.delete());
                });
            }
        }
    },

    /**
     * @param {VoiceState} oldVoiceState
     */
    privateVoiceChatRequestHandler: async (oldVoiceState) => {
        const member = oldVoiceState.member;
        await Promise.all([
            member.guild.channels.create(`${member.displayName}`, {
                parent: Guild.smallVoiceCategoryChannel,
            }),
            member.guild.channels.create(`[Private] ${member.displayName}`, {
                type: 'voice',
                parent: Guild.smallVoiceCategoryChannel,
            }),
            member.guild.channels.create("[Waiting room] ⬆️", {
                type: 'voice',
                parent: Guild.smallVoiceCategoryChannel,
            }),
        ]).then(async ([textChannel, voiceChannel, waitingChannel]) => {
            await Promise.all([
                textChannel.updateOverwrite(Config.roles.realEveryone, {SEND_MESSAGES: false}),
                textChannel.updateOverwrite(member, {SEND_MESSAGES: true}),
                voiceChannel.updateOverwrite(Config.roles.realEveryone, {CONNECT: false}),
            ]);
            await member.voice.setChannel(voiceChannel);
            await PrivateVC.add(member.id, textChannel.id, voiceChannel.id, waitingChannel.id).catch(exception => {
                exception.payload = [ textChannel, voiceChannel, waitingChannel ];
                throw exception;
            });

            const embed = new Discord.MessageEmbed().addFields([
                {name: '🔓', value: 'Public', inline: true},
                {name: '🔒', value: 'Private', inline: true},
            ]).setTitle('Public or private channel?').setFooter('React below!').setColor(0x00FF00);
            const sentMessage = await textChannel.send({content: member, embed: embed});
            await Promise.all([sentMessage.react('🔓'), sentMessage.react('🔒')]);
        }).catch(async (exception) => {
            Logger.exception(exception);
            await Guild.botChannel.send(trans('model.privateVC.errors.creationFailed.mods', [member.toString()]));
            await member.send(trans('model.privateVC.errors.creationFailed.member'));
            await member.voice.setChannel(oldVoiceState.channel);
            exception.payload.forEach(async channel => await channel.delete());
        });
    },

    /**
     * @param {VoiceState} oldVoiceState
     */
    privateVoiceChatDeletionHandler: async (oldVoiceState) => {
        const member = oldVoiceState.member;
        const channels = PrivateVC.list[member.id].map(id => Guild.discordGuild.channels.cache.find(channel => channel.id === id));

        channels.filter(channel => channel !== undefined).forEach(async channel => await channel.delete());

        return PrivateVC.remove(member.id).catch(async exception => {
            Logger.exception(exception);
            await Guild.botChannel.send(trans('model.privateVC.errors.deletionFailed', [privateChannel.id, member.toString()]));
        });
    },

    /**
     * @param {VoiceState} newVoiceState
     */
    privateVoiceChatJoinHandler: async (requestor, newVoiceState) => {
        const hostMember = await Guild.discordGuild.members.fetch(requestor);

        const guestMember = newVoiceState.member;
        const guestUser = guestMember.user;

        const emojis = ['pollyes', 'pollno'].map(name => bot.emojis.cache.find(emoji => emoji.name === name));
        const channels = PrivateVC.list[requestor].map(id => Guild.discordGuild.channels.cache.find(channel => channel.id === id));

        const embed = new Discord.MessageEmbed()
            .setAuthor(
                `${guestUser.username}#${guestUser.discriminator}`,
                guestUser.displayAvatarURL({ dynamic: true })
            )
            .setDescription(guestMember.toString())
            .setColor(0x00FF00)
            .setFooter('Open the door?');
        const sentMessage = await channels[0].send({
            content: `${hostMember}, someone wants to join your room!`,
            embed: embed,
        });
        emojis.forEach(async emoji => await sentMessage.react(emoji));
    },
}

module.exports = PrivateVC;
