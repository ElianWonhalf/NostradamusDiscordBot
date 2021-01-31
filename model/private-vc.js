const Discord = require('discord.js');
const Logger = require('@lilywonhalf/pretty-logger');
const Config = require('../config.json');
const db = require('./db');
const Guild = require('./guild');

const PrivateVC = {
    /** {Object} */
    list: {},

    /** {Object} */
    pendingJoinRequests: {},

    /** {bool} */
    shutdown: false,

    /**
     * @returns {Promise}
     */
    init: async () => {
        const rows = await db.asyncQuery('SELECT requestor, text_channel, voice_channel, waiting_channel, renamed FROM private_vc');

        rows.forEach(row => {
            PrivateVC.list[row.requestor] = [
                row.text_channel,
                row.voice_channel,
                row.waiting_channel,
                row.renamed
            ];
        });
    },

    /**
     * @param {GuildMember} member
     * @param {VoiceState} oldVoiceState
     * @param {VoiceState} newVoiceState
     */
    privateVCHandler: (member, oldVoiceState, newVoiceState) => {
        if (oldVoiceState.channelID === newVoiceState.channelID) {
            return;
        }

        const privateVCData = PrivateVC.list[member.id];

        if (newVoiceState.channelID === Config.channels.smallVoiceChatRequest) {
            // Request new VC
            PrivateVC.privateVoiceChatRequestHandler(member, oldVoiceState);
        }

        if (newVoiceState.channel) {
            // Join private VC
            const requestor = Object.keys(PrivateVC.list).find(
                id => PrivateVC.list[id][2] === newVoiceState.channelID
            );

            if (requestor && requestor !== member.id) {
                PrivateVC.privateVoiceChatJoinHandler(requestor, newVoiceState);
            }
        }

        if (oldVoiceState.channel) {
            const vcRequestor = Object.keys(PrivateVC.list).find(
                id => PrivateVC.list[id][1] === oldVoiceState.channelID
            );
            const waitingRoomRequestor = Object.keys(PrivateVC.list).find(
                id => PrivateVC.list[id][2] === oldVoiceState.channelID
            );

            // Leave VC
            if (vcRequestor) {
                PrivateVC.privateVoiceChatLeaveHandler(member, vcRequestor);
            }

            // Leave waiting room
            if (waitingRoomRequestor) {
                PrivateVC.waitingRoomLeaveHandler(member, waitingRoomRequestor);
            }
        }

        if (privateVCData && oldVoiceState.channelID === privateVCData[1]) {
            // Transfer property (if applicable)
            PrivateVC.propertyTransferSwitch(member);
        }
    },

    /**
     * @param {string} requestor
     * @param {string} textChannel
     * @param {string} voiceChannel
     * @param {string} waitingChannel
     * @returns {Promise}
     */
    add: async (requestor, textChannel, voiceChannel, waitingChannel) => {
        await db.asyncQuery('SET NAMES utf8mb4');
        await db.asyncQuery(
            `INSERT INTO private_vc (requestor, text_channel, voice_channel, waiting_channel) VALUES (?, ?, ?, ?)`,
            [requestor, textChannel, voiceChannel, waitingChannel]
        );

        PrivateVC.list[requestor] = [textChannel, voiceChannel, waitingChannel, 0];
    },

    /**
     * @param {string} requestor
     * @returns {Promise}
     */
    remove: async (requestor) => {
        await db.asyncQuery(`DELETE FROM private_vc WHERE requestor = ?`, [requestor]);
        delete PrivateVC.list[requestor];
    },

    /**
     * @param {string} requestor
     * @returns {Promise}
     */
    makePublic: async (requestor) => {
        await db.asyncQuery(`UPDATE private_vc SET waiting_channel = NULL WHERE requestor = ?`, [requestor]);
        PrivateVC.list[requestor].splice(2, 1, undefined);
    },

    /**
     * @param {string} requestor
     * @param {string} waitingChannelID
     * @returns {Promise}
     */
    makePrivate: async (requestor, waitingChannelID) => {
        await db.asyncQuery(
            `UPDATE private_vc SET waiting_channel = ? WHERE requestor = ?`,
            [waitingChannelID, requestor]
        );

        PrivateVC.list[requestor].splice(2, 1, waitingChannelID);
    },

    /**
     * @param {string} previousOwner
     * @param {string} newOwner
     * @returns {Promise}
     */
    setOwner: async (previousOwner, newOwner) => {
        await db.asyncQuery(`UPDATE private_vc SET requestor = ? WHERE requestor = ?`, [newOwner, previousOwner]);
        PrivateVC.list[newOwner] = PrivateVC.list[previousOwner];
        delete PrivateVC.list[previousOwner];
    },

    /**
     * @param {string} requestor
     * @returns {boolean}
     */
    isPrivate: (requestor) => {
        return PrivateVC.list[requestor][2] !== undefined;
    },

    /**
     * @param {TextChannel} channel
     */
    deleteTextChannelMessages: async (channel) => {
        let deletedMessages;

        do {
            deletedMessages = await channel.bulkDelete(100);
        } while (deletedMessages.size > 0);
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
        const privateVCData = PrivateVC.list[user.id];
        const message = reaction.message;
        const hasSingleEmbed = message.embeds.length === 1;
        const isByMe = message.author.id === bot.user.id;
        const requestorReacted = user.id !== bot.user.id && privateVCData && privateVCData[0] === message.channel.id;
        const channelTypeReactionEmojis = ['🔒', '🔓'];
        const joinRequestReactionEmojis = ['pollyes', 'pollno'];

        if (hasSingleEmbed && isByMe && requestorReacted) {
            const botReactionEmojis = message.reactions.cache.filter(reaction => reaction.me).map(reaction => reaction.emoji.name);

            if (!botReactionEmojis.includes(reaction.emoji.name)) {
                return;
            }

            const channels = privateVCData.slice(0, 3).map(id => Guild.discordGuild.channels.cache.find(channel => channel.id === id));
            const voiceChannelsCount = Guild.smallVoiceCategoryChannel.children.size;

            // Let member knocking on door in or not?
            if (joinRequestReactionEmojis.includes(reaction.emoji.name)) {
                const guestMember = await Guild.getMemberFromMention(message.embeds[0].description);
                if (guestMember === null) {
                    await channels[0].send(trans('model.privateVC.errors.memberNotFound'));
                    return;
                }

                if (guestMember.voice.channelID !== privateVCData[2]) {
                    await channels[0].send(trans('model.privateVC.errors.memberNotWaiting', [guestMember.displayName]));
                    return;
                }

                if (reaction.emoji.name === 'pollyes') {
                    await guestMember.voice.setChannel(channels[1]);
                    await channels[0].updateOverwrite(guestMember, {VIEW_CHANNEL: true});
                } else {
                    await guestMember.voice.setChannel(null);
                }
            }

            // Make channel public or private
            if (channelTypeReactionEmojis.includes(reaction.emoji.name)) {
                if (reaction.emoji.name === '🔓' && PrivateVC.isPrivate(user.id)) {
                    PrivateVC.moveWaitingGuestsToVoiceChannel(channels[1]);
                    await PrivateVC.makePublic(user.id).then(async () => {
                        await channels[2].delete();
                        channels.pop();

                        await channels.forEach(channel => channel.lockPermissions());
                        await channels[0].send(trans('model.privateVC.channelType.complete.public', [user.toString()]));

                        // If deleting waiting channel for target private VC leaves room for two new channels,
                        // unlock VC request channel.
                        if (voiceChannelsCount - 1 <= channelPerCategoryLimit - 2) {
                            PrivateVC.unlockRequestChannel();
                        }
                    }).catch(async exception => {
                        Logger.exception(exception);
                        await Guild.botChannel.send(trans('model.privateVC.errors.modificationFailed.mods', [user.toString()], 'en'));
                        await user.send(trans('model.privateVC.errors.modificationFailed.member'));

                        // Kicking the host member from the voice chat will trigger deletion of channels.
                        const hostMember = await Guild.discordGuild.member(user.id);
                        await hostMember.voice.setChannel(null);
                    });
                } else if (reaction.emoji.name === '🔒') {
                    if (!PrivateVC.isPrivate(user.id)) {
                        let waitingChannel;

                        try {
                            waitingChannel = await Guild.discordGuild.channels.create(`⬆️ [${trans('model.privateVC.waitingRoomLabel')}]`, {
                                type: 'voice',
                                parent: Guild.smallVoiceCategoryChannel,
                                position: channels[1].rawPosition,
                            });

                            await Promise.all([
                                channels[0].updateOverwrite(Guild.discordGuild.roles.everyone, {VIEW_CHANNEL: false}),
                                channels[1].updateOverwrite(Guild.discordGuild.roles.everyone, {CONNECT: false}),
                                channels[1].updateOverwrite(user, {MOVE_MEMBERS: true}),
                                waitingChannel.updateOverwrite(Guild.discordGuild.roles.everyone, {SPEAK: false}),
                            ]);
                            await Promise.all(channels[1].members.map(member => channels[0].updateOverwrite(member, {VIEW_CHANNEL: true})));

                            await PrivateVC.makePrivate(user.id, waitingChannel.id).catch(exception => {
                                exception.payload = [channels[0], channels[1], waitingChannel];
                                throw exception;
                            });
                        } catch (exception) {
                            const hostMember = await Guild.discordGuild.member(user.id);

                            Logger.exception(exception);
                            await Guild.botChannel.send(trans('model.privateVC.errors.modificationFailed.mods', [member.toString()], 'en'));
                            await hostMember.send(trans('model.privateVC.errors.modificationFailed.member'));
                            await hostMember.voice.setChannel(oldVoiceState.channel);

                            if (exception.payload) {
                                exception.payload.filter(channel => channel !== undefined).forEach(channel => channel.delete());
                            }

                            return;
                        }

                        // If fulfilling current private VC request doesn't leave room for two new channels,
                        // lock VC request channel.
                        if (voiceChannelsCount + 1 > channelPerCategoryLimit - 2) {
                            PrivateVC.lockRequestChannel();
                        }
                    }

                    await channels[0].send(trans('model.privateVC.channelType.complete.private', [user.toString()]));
                }

                await reaction.users.remove(user);
            }
        }
    },

    lockRequestChannel: async () => {
        await Guild.smallVoiceChatRequestChannel.updateOverwrite(Guild.discordGuild.roles.everyone, {VIEW_CHANNEL: false, CONNECT: false});
        if (PrivateVC.shutdown) {
            await Guild.smallVoiceChatRequestChannel.setName(trans('model.privateVC.requestChannelName.closed'));
        } else {
            await Guild.smallVoiceChatRequestChannel.setName(trans('model.privateVC.requestChannelName.full'));
        }
    },

    unlockRequestChannel: async () => {
        await Guild.smallVoiceChatRequestChannel.lockPermissions();
        await Guild.smallVoiceChatRequestChannel.setName(trans('model.privateVC.requestChannelName.available'));
    },

    emergencyShutdown: async () => {
        PrivateVC.shutdown = true;
        PrivateVC.lockRequestChannel();
        PrivateVC.pendingJoinRequests = {};

        Object.keys(PrivateVC.list).forEach(async memberID => {
            const member = await Guild.discordGuild.member(memberID);
            await member.voice.setChannel(null);
        });
    },

    /**
     * @param {VoiceChannel} voiceChannel
     */
    moveWaitingGuestsToVoiceChannel: (voiceChannel) => {
        if (!PrivateVC.pendingJoinRequests[voiceChannel.id]) {
            return;
        }

        Object.entries(PrivateVC.pendingJoinRequests[voiceChannel.id]).forEach(async pair => {
            const [memberID, message] = pair;
            const member = Guild.discordGuild.member(memberID);
            await member.voice.setChannel(voiceChannel);
            await message.delete();
        });

        delete PrivateVC.pendingJoinRequests[voiceChannel.id];
    },

    /**
     * @param {GuildMember} member
     * @param {VoiceState} oldVoiceState
     */
    privateVoiceChatRequestHandler: async (member, oldVoiceState) => {
        const voiceChannelsCount = Guild.smallVoiceCategoryChannel.children.size;
        let textChannel, voiceChannel, waitingChannel;

        try {
            textChannel = await member.guild.channels.create(`${member.displayName}`, {
                parent: Guild.smallVoiceTextCategoryChannel,
            });

            voiceChannel = await member.guild.channels.create(`${member.displayName}`, {
                type: 'voice',
                parent: Guild.smallVoiceCategoryChannel,
            });

            waitingChannel = await member.guild.channels.create(`⬆️ [${trans('model.privateVC.waitingRoomLabel')}]`, {
                type: 'voice',
                parent: Guild.smallVoiceCategoryChannel,
            });

            await Promise.all([
                textChannel.updateOverwrite(Guild.discordGuild.roles.everyone, {VIEW_CHANNEL: false}),
                textChannel.updateOverwrite(member, {VIEW_CHANNEL: true}),
                voiceChannel.updateOverwrite(Guild.discordGuild.roles.everyone, {CONNECT: false}),
                voiceChannel.updateOverwrite(member, {MOVE_MEMBERS: true}),
                waitingChannel.updateOverwrite(Guild.discordGuild.roles.everyone, {SPEAK: false}),
            ]);

            await member.voice.setChannel(voiceChannel).catch(exception => {
                exception.payload = [textChannel, voiceChannel, waitingChannel];
                throw exception;
            });
            await PrivateVC.add(member.id, textChannel.id, voiceChannel.id, waitingChannel.id).catch(exception => {
                exception.payload = [textChannel, voiceChannel, waitingChannel];
                throw exception;
            });
        } catch (exception) {
            Logger.exception(exception);
            await Guild.botChannel.send(trans('model.privateVC.errors.creationFailed.mods', [member.toString()], 'en'));
            await member.send(trans('model.privateVC.errors.creationFailed.member'));
            await member.voice.setChannel(oldVoiceState.channel);

            if (exception.payload) {
                exception.payload.filter(channel => channel !== undefined).forEach(channel => channel.delete());
            }

            return;
        }

        // If fulfilling current private VC request doesn't leave room for two new channels,
        // lock VC request channel.
        if (voiceChannelsCount + 2 > channelPerCategoryLimit - 2) {
            PrivateVC.lockRequestChannel();
        }

        const embed = new Discord.MessageEmbed()
            .addFields([
                {name: '🔓', value: trans('model.privateVC.channelType.public'), inline: true},
                {name: '🔒', value: trans('model.privateVC.channelType.private'), inline: true},
            ])
            .setTitle(trans('model.privateVC.channelType.embed.title'))
            .setFooter(trans('model.privateVC.channelType.embed.footer'))
            .setColor(0x00FF00);

        const sentMessage = await textChannel.send({content: member, embed: embed});
        await Promise.all([sentMessage.react('🔓'), sentMessage.react('🔒')]);
        await sentMessage.pin();
    },

    /**
     * @param {GuildMember} member
     * @param {Array} channels
     */
    privateVoiceChatDeletionHandler: async (member, channels) => {
        const voiceChannelsCount = Guild.smallVoiceCategoryChannel.children.size;
        const foundChannels = channels.filter(channel => channel !== undefined);
        const voiceChannelsToDeleteCount = foundChannels.length - 1;

        await channels[0].lockPermissions();
        await channels[0].updateOverwrite(Guild.discordGuild.roles.everyone, {VIEW_CHANNEL: false});
        await PrivateVC.deleteTextChannelMessages(channels[0]);
        await Promise.all(foundChannels.map(channel => channel.delete()));
        await PrivateVC.remove(member.id).catch(async exception => {
            Logger.exception(exception);
            await Guild.botChannel.send(
                trans(
                    'model.privateVC.errors.deletionFailed',
                    [member.id, member.toString()],
                    'en'
                )
            );
        });

        // If deleting channel(s) for current private VC leaves room for two new channels,
        // unlock VC request channel.
        if (!PrivateVC.shutdown && voiceChannelsCount - voiceChannelsToDeleteCount <= channelPerCategoryLimit - 2) {
            PrivateVC.unlockRequestChannel();
        }
    },

    /**
     * @param {Snowflake} requestor
     * @param {VoiceState} newVoiceState
     */
    privateVoiceChatJoinHandler: async (requestor, newVoiceState) => {
        const hostMember = Guild.discordGuild.member(requestor);

        const guestMember = newVoiceState.member;
        const guestUser = guestMember.user;

        const emojis = ['pollyes', 'pollno'].map(name => bot.emojis.cache.find(emoji => emoji.name === name));
        const channels = PrivateVC.list[requestor].slice(0, 3).map(id => Guild.discordGuild.channels.cache.find(channel => channel.id === id));

        const embed = new Discord.MessageEmbed()
            .setAuthor(
                `${guestUser.username}#${guestUser.discriminator}`,
                guestUser.displayAvatarURL({ dynamic: true })
            )
            .setDescription(guestMember.toString())
            .setColor(0x00FF00)
            .setFooter(trans('model.privateVC.joinRequest.prompt'));
        const sentMessage = await channels[0].send({
            content: trans('model.privateVC.joinRequest.notification', [hostMember]),
            embed: embed,
        });
        emojis.forEach(emoji => sentMessage.react(emoji));

        PrivateVC.pendingJoinRequests[channels[1].id] = PrivateVC.pendingJoinRequests[channels[1].id] || {};
        Object.assign(PrivateVC.pendingJoinRequests[channels[1].id], {[guestMember.id]: sentMessage});
    },

    /**
     * @param {GuildMember} guestMember
     * @param {Snowflake} requestor
     */
    privateVoiceChatLeaveHandler: async (guestMember, requestor) => {
        const channels = PrivateVC.list[requestor].slice(0, 3).map(id => Guild.discordGuild.channels.cache.find(channel => channel.id === id));

        if (channels[0]) {
            const overwrites = channels[0].permissionOverwrites;

            if (channels[2]) {
                await channels[0].overwritePermissions(overwrites.filter(overwrite => overwrite.id !== guestMember.id));
            }
        }
    },

    /**
     * @param {GuildMember} currentHostMember
     */
    privateVoiceChatPropertyTransferHandler: async (currentHostMember, channels) => {
        const memberPermissionLevels = new Discord.Collection();
        const permissionLevelRoles = Guild.permissionLevels.keyArray().map(roleID => Guild.discordGuild.roles.cache.get(roleID));
        let highestPermissionLevelRole;

        channels[1].members.filter(member => member.id !== currentHostMember.id).each(member => {
            highestPermissionLevelRole = null;
            const memberPermissionLevelRoles = member.roles.cache.array().filter(role => permissionLevelRoles.includes(role));

            memberPermissionLevelRoles.forEach(role => {
                if (highestPermissionLevelRole === null || Guild.permissionLevels.get(role.id) > Guild.permissionLevels.get(highestPermissionLevelRole.id)) {
                    highestPermissionLevelRole = role;
                }
            });

            const permissionLevel = Guild.permissionLevels.get(highestPermissionLevelRole.id);
            const currentMembers = memberPermissionLevels.get(permissionLevel) || [];
            memberPermissionLevels.set(permissionLevel, [...currentMembers, member]);
        });

        const permissionLevelsWithMembers = Guild.permissionLevels.filter(level => memberPermissionLevels.get(level));
        const highestRankedMembers = memberPermissionLevels.get(permissionLevelsWithMembers.first());
        const newHostMember = highestRankedMembers[Math.floor(Math.random() * highestRankedMembers.length)];

        try {
            await PrivateVC.setOwner(currentHostMember.id, newHostMember.id).catch(exception => {
                exception.payload = channels;
                throw exception;
            });
            PrivateVC.renameTransferredChannels(channels, newHostMember);
            await channels[0].send(trans('model.privateVC.transferredProperty', [newHostMember.toString(), currentHostMember.toString()]));
        } catch (exception) {
            Logger.exception(exception);
            await Guild.botChannel.send(
                trans(
                    'model.privateVC.errors.propertyTransferFailed',
                    [currentHostMember.toString(), newHostMember.toString()],
                    'en'
                )
            );

            channels.filter(channel => channel !== undefined).forEach(channel => channel.delete());
        }
    },

    /**
     * @param {GuildMember} member
     */
    propertyTransferSwitch: async (member) => {
        const channels = PrivateVC.list[member.id].slice(0, 3).map(
            id => Guild.discordGuild.channels.cache.find(channel => channel.id === id)
        );

        if (channels[1].members.size === 0) {
            PrivateVC.privateVoiceChatDeletionHandler(member, channels);
        } else {
            PrivateVC.privateVoiceChatPropertyTransferHandler(member, channels);
        }
    },

    /**
     * @param {Array} channels
     * @param {GuildMember} newHostMember
     */
    renameTransferredChannels: async (channels, newHostMember) => {
        const renamed = PrivateVC.list[newHostMember.id][3] === 1;
        if (!renamed) {
            await Promise.all([
                channels[0].setName(newHostMember.displayName),
                channels[1].setName(newHostMember.displayName),
            ]);
        }
    },

    /**
     * @param {GuildMember} guestMember
     * @param {Snowflake} requestor
     */
    waitingRoomLeaveHandler: async (guestMember, requestor) => {
        const channels = PrivateVC.list[requestor].slice(0, 3).map(id => Guild.discordGuild.channels.cache.find(channel => channel.id === id));

        if (channels[1]) {
            const message = PrivateVC.pendingJoinRequests[channels[1].id][guestMember.id];

            await message.delete();
            delete PrivateVC.pendingJoinRequests[channels[1].id][guestMember.id];
        }
    },
}

module.exports = PrivateVC;
