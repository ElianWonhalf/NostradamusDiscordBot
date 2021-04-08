const Discord = require('discord.js');
const Logger = require('@lilywonhalf/pretty-logger');
const Config = require('../config.json');
const db = require('./db');
const Guild = require('./guild');

const OnDemandVC = {
    /** {Object} */
    list: {},

    /** {Object} */
    deniedMembers: {},

    /** {Object} */
    introMessages: {},

    /** {Object} */
    pendingJoinRequests: {},

    /** {Discord.Collection} */
    pendingLeaveFollowupActions: new Discord.Collection(),

    /** {bool} */
    shutdown: false,

    /**
     * @returns {Promise}
     */
    init: async () => {
        const rows = await db.asyncQuery('SELECT requestor, text_channel, voice_channel, waiting_channel, renamed FROM on_demand_vc');

        rows.forEach(row => {
            OnDemandVC.list[row.requestor] = [
                row.text_channel,
                row.voice_channel,
                row.waiting_channel,
                row.renamed
            ];
        });
    },

    dbSync: async () => {
        for (let owner in OnDemandVC.list) {
            delete OnDemandVC.list[owner];
        }

        await OnDemandVC.init();
    },

    /**
     * @param {GuildMember} member
     * @param {VoiceState} oldVoiceState
     * @param {VoiceState} newVoiceState
     */
    onDemandVCHandler: (member, oldVoiceState, newVoiceState) => {
        if (oldVoiceState.channelID === newVoiceState.channelID) {
            return;
        }

        const onDemandVCData = OnDemandVC.list[member.id];

        if (newVoiceState.channelID === Config.channels.smallVoiceChatRequest) {
            // Request new VC
            OnDemandVC.requestHandler(member, oldVoiceState);
        }

        if (newVoiceState.channel) {
            // Join on-demand VC
            const requestor = Object.keys(OnDemandVC.list).find(
                id => OnDemandVC.list[id][2] === newVoiceState.channelID
            );

            if (requestor && requestor !== member.id) {
                OnDemandVC.joinHandler(requestor, newVoiceState.member);
            }
        }

        if (oldVoiceState.channel) {
            const vcRequestor = Object.keys(OnDemandVC.list).find(
                id => OnDemandVC.list[id][1] === oldVoiceState.channelID
            );
            const waitingRoomRequestor = Object.keys(OnDemandVC.list).find(
                id => OnDemandVC.list[id][2] === oldVoiceState.channelID
            );

            // Leave VC
            if (vcRequestor && vcRequestor !== member.id) {
                OnDemandVC.leaveHandler(member, vcRequestor);
            }

            // Leave waiting room
            if (waitingRoomRequestor) {
                OnDemandVC.waitingRoomLeaveHandler(member, waitingRoomRequestor);
            }
        }

        if (onDemandVCData && oldVoiceState.channelID === onDemandVCData[1]) {
            // Owner leaves room: schedule on-demand channels housekeeping if not already scheduled
            if (OnDemandVC.pendingLeaveFollowupActions.size === 0) {
                const followupActionTimeout = setTimeout(OnDemandVC.channelHousekeeping, 5000);
                OnDemandVC.pendingLeaveFollowupActions.set(member.id, followupActionTimeout);
            }
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
            `INSERT INTO on_demand_vc (requestor, text_channel, voice_channel, waiting_channel) VALUES (?, ?, ?, ?)`,
            [requestor, textChannel, voiceChannel, waitingChannel]
        );

        OnDemandVC.list[requestor] = [textChannel, voiceChannel, waitingChannel, 0];
    },

    /**
     * @param {string} requestor
     * @returns {Promise}
     */
    remove: async (requestor) => {
        await db.asyncQuery(`DELETE FROM on_demand_vc WHERE requestor = ?`, [requestor]);
        delete OnDemandVC.list[requestor];
    },

    /**
     * @param {string} requestor
     * @returns {Promise}
     */
    makePublic: async (requestor) => {
        await db.asyncQuery(`UPDATE on_demand_vc SET waiting_channel = NULL WHERE requestor = ?`, [requestor]);
        OnDemandVC.list[requestor].splice(2, 1, undefined);
    },

    /**
     * @param {string} requestor
     * @param {string} waitingChannelID
     * @returns {Promise}
     */
    makePrivate: async (requestor, waitingChannelID) => {
        await db.asyncQuery(
            `UPDATE on_demand_vc SET waiting_channel = ? WHERE requestor = ?`,
            [waitingChannelID, requestor]
        );

        OnDemandVC.list[requestor].splice(2, 1, waitingChannelID);
    },

    /**
     * @param {string} previousOwner
     * @param {string} newOwner
     * @returns {Promise}
     */
    setOwner: async (previousOwner, newOwner) => {
        await db.asyncQuery(`UPDATE on_demand_vc SET requestor = ? WHERE requestor = ?`, [newOwner, previousOwner]);
        OnDemandVC.list[newOwner] = OnDemandVC.list[previousOwner];
        delete OnDemandVC.list[previousOwner];
    },

    /**
     * @param {string} owner
     */
    setRenamed: async (owner) => {
        await db.asyncQuery(`UPDATE on_demand_vc SET renamed = 1 WHERE requestor = ?`, [owner]);
        OnDemandVC.list[owner][3] = 1;
    },

    /**
     * @param {string} requestor
     * @returns {boolean}
     */
    isPrivate: (requestor) => {
        return OnDemandVC.list[requestor][2] !== undefined;
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
    getOnDemandChannelsList: () => {
        return Array.from(new Set(Object.values(OnDemandVC.list)));
    },

    /**
     * @param {MessageReaction} reaction
     * @param {User} user
     */
    handleReaction: async (reaction, user) => {
        const onDemandVCData = OnDemandVC.list[user.id];
        const message = reaction.message;
        const hasSingleEmbed = message.embeds.length === 1;
        const isByMe = message.author.id === bot.user.id;
        const requestorReacted = user.id !== bot.user.id && onDemandVCData && onDemandVCData[0] === message.channel.id;
        const channelTypeReactionEmojis = ['🔒', '🔓'];
        const joinRequestReactionEmojis = ['pollyes', 'pollno'];

        if (hasSingleEmbed && isByMe && requestorReacted) {
            const botReactionEmojis = message.reactions.cache.filter(reaction => reaction.me).map(reaction => reaction.emoji.name);

            if (!botReactionEmojis.includes(reaction.emoji.name)) {
                return;
            }

            const channels = onDemandVCData.slice(0, 3).map(id => Guild.discordGuild.channels.cache.find(channel => channel.id === id));
            const voiceChannelsCount = Guild.smallVoiceCategoryChannel.children.size;

            // Let member knocking on door in or not?
            if (joinRequestReactionEmojis.includes(reaction.emoji.name)) {
                const guestMember = await Guild.getMemberFromMention(message.embeds[0].description);
                if (guestMember === null) {
                    await channels[0].send(trans('model.onDemandVC.errors.memberNotFound'));
                    return;
                }

                if (guestMember.voice.channelID !== onDemandVCData[2]) {
                    await channels[0].send(trans('model.onDemandVC.errors.memberNotWaiting', [guestMember.displayName]));
                    return;
                }

                OnDemandVC.deniedMembers[user.id] = OnDemandVC.deniedMembers[user.id] || [];
                if (reaction.emoji.name === 'pollyes') {
                    OnDemandVC.deniedMembers[user.id] = OnDemandVC.deniedMembers[user.id].filter(id => id !== guestMember.id);
                    await guestMember.voice.setChannel(channels[1]);
                    await channels[0].updateOverwrite(guestMember, {VIEW_CHANNEL: true});
                } else {
                    if (!OnDemandVC.deniedMembers[user.id].includes(guestMember.id)) {
                        OnDemandVC.deniedMembers[user.id] = [...OnDemandVC.deniedMembers[user.id], guestMember.id];
                    }
                    await guestMember.voice.setChannel(null);
                }
            }

            // Make channel public or private
            if (channelTypeReactionEmojis.includes(reaction.emoji.name)) {
                if (reaction.emoji.name === '🔓' && OnDemandVC.isPrivate(user.id)) {
                    OnDemandVC.moveWaitingGuestsToVoiceChannel(channels[1]);
                    await OnDemandVC.makePublic(user.id).then(async () => {
                        await channels[2].delete();
                        channels.pop();

                        await channels.forEach(channel => channel.lockPermissions());
                        await channels[0].send(trans('model.onDemandVC.channelType.complete.public', [user.toString()]));

                        // If deleting waiting channel for target on-demand VC leaves room for two new channels,
                        // unlock VC request channel.
                        if (voiceChannelsCount - 1 <= channelPerCategoryLimit - 2) {
                            OnDemandVC.unlockRequestChannel();
                        }
                    }).catch(async exception => {
                        Logger.exception(exception);
                        await Guild.botChannel.send(trans('model.onDemandVC.errors.modificationFailed.mods', [user.toString()], 'en'));
                        await user.send(trans('model.onDemandVC.errors.modificationFailed.member'));

                        // Kicking the host member from the voice chat will trigger deletion of channels.
                        const hostMember = await Guild.discordGuild.member(user.id);
                        await hostMember.voice.setChannel(null);
                    });
                } else if (reaction.emoji.name === '🔒') {
                    if (!OnDemandVC.isPrivate(user.id)) {
                        let waitingChannel;

                        try {
                            waitingChannel = await Guild.discordGuild.channels.create(`⬆️ [${trans('model.onDemandVC.waitingRoomLabel')}]`, {
                                type: 'voice',
                                parent: Guild.smallVoiceCategoryChannel,
                                position: channels[1].rawPosition,
                            });

                            await Promise.all([
                                channels[0].updateOverwrite(Guild.discordGuild.roles.everyone, {VIEW_CHANNEL: false}),
                                ...channels[1].members.map(member => channels[0].updateOverwrite(member, {VIEW_CHANNEL: true})),
                                channels[1].updateOverwrite(Guild.discordGuild.roles.everyone, {CONNECT: false}),
                                channels[1].updateOverwrite(user, {MOVE_MEMBERS: true}),
                                waitingChannel.updateOverwrite(Guild.discordGuild.roles.everyone, {SPEAK: false, STREAM: false}),
                            ]);

                            await OnDemandVC.makePrivate(user.id, waitingChannel.id).catch(exception => {
                                exception.payload = [channels[0], channels[1], waitingChannel];
                                throw exception;
                            });
                        } catch (exception) {
                            const hostMember = await Guild.discordGuild.member(user.id);

                            Logger.exception(exception);
                            await Guild.botChannel.send(trans('model.onDemandVC.errors.modificationFailed.mods', [member.toString()], 'en'));
                            await hostMember.send(trans('model.onDemandVC.errors.modificationFailed.member'));
                            await hostMember.voice.setChannel(oldVoiceState.channel);

                            if (exception.payload) {
                                exception.payload.filter(channel => channel !== undefined).forEach(channel => channel.delete());
                            }

                            return;
                        }

                        // If fulfilling current on-demand VC request doesn't leave room for two new channels,
                        // lock VC request channel.
                        if (voiceChannelsCount + 1 > channelPerCategoryLimit - 2) {
                            OnDemandVC.lockRequestChannel();
                        }
                    }

                    await channels[0].send(trans('model.onDemandVC.channelType.complete.private', [user.toString()]));
                }

                await reaction.users.remove(user);
            }
        }
    },

    lockRequestChannel: async () => {
        await Guild.smallVoiceChatRequestChannel.updateOverwrite(Guild.discordGuild.roles.everyone, {VIEW_CHANNEL: false, CONNECT: false});
        if (OnDemandVC.shutdown) {
            await Guild.smallVoiceChatRequestChannel.setName(trans('model.onDemandVC.requestChannelName.closed'));
        } else {
            await Guild.smallVoiceChatRequestChannel.setName(trans('model.onDemandVC.requestChannelName.full'));
        }
    },

    unlockRequestChannel: async () => {
        await Guild.smallVoiceChatRequestChannel.lockPermissions();
        await Guild.smallVoiceChatRequestChannel.setName(trans('model.onDemandVC.requestChannelName.available'));
    },

    emergencyShutdown: async () => {
        OnDemandVC.shutdown = true;
        OnDemandVC.lockRequestChannel();
        OnDemandVC.pendingJoinRequests = {};

        Object.keys(OnDemandVC.list).forEach(async memberID => {
            const member = await Guild.discordGuild.member(memberID);
            await member.voice.setChannel(null);
        });
    },

    /**
     * @param {VoiceChannel} voiceChannel
     */
    moveWaitingGuestsToVoiceChannel: (voiceChannel) => {
        if (!OnDemandVC.pendingJoinRequests[voiceChannel.id]) {
            return;
        }

        Object.entries(OnDemandVC.pendingJoinRequests[voiceChannel.id]).forEach(async pair => {
            const [memberID, message] = pair;
            const member = Guild.discordGuild.member(memberID);
            await member.voice.setChannel(voiceChannel);
            await message.delete();
        });

        delete OnDemandVC.pendingJoinRequests[voiceChannel.id];
    },

    /**
     * @param {GuildMember} member
     * @param {VoiceState} oldVoiceState
     */
    requestHandler: async (member, oldVoiceState) => {
        if (OnDemandVC.list[member.id]) {
            await Guild.botChannel.send(trans('model.onDemandVC.errors.alreadyExists.mods', [member.toString()], 'en'));
            await member.send(trans('model.onDemandVC.errors.alreadyExists.member'));
            await member.voice.setChannel(null);
            return;
        }

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

            waitingChannel = await member.guild.channels.create(`⬆️ [${trans('model.onDemandVC.waitingRoomLabel')}]`, {
                type: 'voice',
                parent: Guild.smallVoiceCategoryChannel,
            });

            await Promise.all([
                textChannel.updateOverwrite(Guild.discordGuild.roles.everyone, {VIEW_CHANNEL: false}),
                textChannel.updateOverwrite(member, {VIEW_CHANNEL: true}),
                voiceChannel.updateOverwrite(Guild.discordGuild.roles.everyone, {CONNECT: false}),
                voiceChannel.updateOverwrite(member, {MOVE_MEMBERS: true}),
                waitingChannel.updateOverwrite(Guild.discordGuild.roles.everyone, {SPEAK: false, STREAM: false}),
            ]);

            await member.voice.setChannel(voiceChannel).catch(exception => {
                exception.payload = [textChannel, voiceChannel, waitingChannel];
                throw exception;
            });
            await OnDemandVC.add(member.id, textChannel.id, voiceChannel.id, waitingChannel.id).catch(exception => {
                exception.payload = [textChannel, voiceChannel, waitingChannel];
                throw exception;
            });
        } catch (exception) {
            Logger.exception(exception);
            await Guild.botChannel.send(trans('model.onDemandVC.errors.creationFailed.mods', [member.toString()], 'en'));
            await member.send(trans('model.onDemandVC.errors.creationFailed.member'));
            await member.voice.setChannel(oldVoiceState.channel);

            if (exception.payload) {
                exception.payload.filter(channel => channel !== undefined).forEach(channel => channel.delete());
            }

            return;
        }

        // If fulfilling current on-demand VC request doesn't leave room for two new channels,
        // lock VC request channel.
        if (voiceChannelsCount + 2 > channelPerCategoryLimit - 2) {
            OnDemandVC.lockRequestChannel();
        }

        const sentIntroMessage = await textChannel.send(trans('model.onDemandVC.introMessage', [member.toString(), Config.prefix, Config.prefix, Config.prefix]));
        OnDemandVC.introMessages[member.id] = sentIntroMessage;

        const embed = new Discord.MessageEmbed()
            .addFields([
                {name: '🔓', value: trans('model.onDemandVC.channelType.public'), inline: true},
                {name: '🔒', value: trans('model.onDemandVC.channelType.private'), inline: true},
            ])
            .setTitle(trans('model.onDemandVC.channelType.embed.title'))
            .setFooter(trans('model.onDemandVC.channelType.embed.footer'))
            .setColor(0x00FF00);

        const sentPrompt = await textChannel.send(embed);
        await Promise.all([sentPrompt.react('🔓'), sentPrompt.react('🔒')]);
        await sentPrompt.pin();
    },

    /**
     * @param {GuildMember} member
     * @param {Array} channels
     */
    deletionHandler: async (member, channels) => {
        const voiceChannelsCount = Guild.smallVoiceCategoryChannel.children.size;
        const foundChannels = channels.filter(channel => channel !== undefined);
        const voiceChannelsToDeleteCount = foundChannels.length - 1;

        await channels[0].lockPermissions();
        await channels[0].updateOverwrite(Guild.discordGuild.roles.everyone, {VIEW_CHANNEL: false});
        await OnDemandVC.deleteTextChannelMessages(channels[0]);
        await Promise.all(foundChannels.map(channel => channel.delete()));
        await OnDemandVC.remove(member.id).catch(async exception => {
            Logger.exception(exception);
            await Guild.botChannel.send(
                trans(
                    'model.onDemandVC.errors.deletionFailed',
                    [member.id, member.toString()],
                    'en'
                )
            );
        });

        // If deleting channel(s) for current on-demand VC leaves room for two new channels,
        // unlock VC request channel.
        if (!OnDemandVC.shutdown && voiceChannelsCount - voiceChannelsToDeleteCount <= channelPerCategoryLimit - 2) {
            OnDemandVC.unlockRequestChannel();
        }
    },

    /**
     * @param {Snowflake} requestor
     * @param {GuildMember} guestMember
     */
    joinHandler: async (requestor, guestMember) => {
        const hostMember = Guild.discordGuild.member(requestor);
        const guestUser = guestMember.user;
        const emojis = ['pollyes', 'pollno'].map(name => bot.emojis.cache.find(emoji => emoji.name === name));
        const channels = OnDemandVC.list[requestor].slice(0, 3).map(id => Guild.discordGuild.channels.cache.find(channel => channel.id === id));

        let content;
        if (OnDemandVC.deniedMembers[requestor] && OnDemandVC.deniedMembers[requestor].includes(guestMember.id)) {
            content = trans('model.onDemandVC.joinRequest.notification.withoutPing');
        } else {
            content = trans('model.onDemandVC.joinRequest.notification.withPing', [hostMember]);
        }

        const embed = new Discord.MessageEmbed()
            .setAuthor(
                `${guestUser.username}#${guestUser.discriminator}`,
                guestUser.displayAvatarURL({ dynamic: true })
            )
            .setDescription(guestMember.toString())
            .setColor(0x00FF00)
            .setFooter(trans('model.onDemandVC.joinRequest.prompt'));
        const sentMessage = await channels[0].send({content: content, embed: embed});

        emojis.forEach(emoji => sentMessage.react(emoji));

        OnDemandVC.pendingJoinRequests[channels[1].id] = OnDemandVC.pendingJoinRequests[channels[1].id] || {};
        Object.assign(OnDemandVC.pendingJoinRequests[channels[1].id], {[guestMember.id]: sentMessage});
    },

    /**
     * @param {GuildMember} guestMember
     * @param {Snowflake} requestor
     */
    leaveHandler: async (guestMember, requestor) => {
        const channels = OnDemandVC.list[requestor].slice(0, 3).map(id => Guild.discordGuild.channels.cache.find(channel => channel.id === id));

        let followupActionTimeout = OnDemandVC.pendingLeaveFollowupActions.get(requestor);

        if (followupActionTimeout) {
            clearTimeout(followupActionTimeout);
            OnDemandVC.pendingLeaveFollowupActions.delete(requestor);
            followupActionTimeout = setTimeout(OnDemandVC.channelHousekeeping, 5000);
            OnDemandVC.pendingLeaveFollowupActions.set(requestor, followupActionTimeout);
        }

        if (channels[0]) {
            const overwrites = channels[0].permissionOverwrites;

            if (channels[2]) {
                await channels[0].overwritePermissions(overwrites.filter(overwrite => overwrite.id !== guestMember.id));
            }
        }
    },

    /**
     * @param {Array} channels
     * @param {GuildMember} currentHostMember
     * @param {GuildMember} targetHostMember
     * @returns {GuildMember}
     */
    propertyTransferHandler: async (channels, currentHostMember, targetHostMember) => {
        const newHostMember = targetHostMember ? targetHostMember : OnDemandVC.pickNewOwner(channels, currentHostMember);

        try {
            await OnDemandVC.setOwner(currentHostMember.id, newHostMember.id).catch(exception => {
                exception.payload = channels;
                throw exception;
            });
            OnDemandVC.transferChannelPermissions(channels, currentHostMember, newHostMember);
            OnDemandVC.renameTransferredChannels(channels, newHostMember);

            if (OnDemandVC.introMessages[currentHostMember.id]) {
                OnDemandVC.introMessages[newHostMember.id] = OnDemandVC.introMessages[currentHostMember.id];
                delete OnDemandVC.introMessages[currentHostMember.id];
                await OnDemandVC.introMessages[newHostMember.id].edit(trans(
                    'model.onDemandVC.introMessage',
                    [newHostMember.toString(), Config.prefix, Config.prefix]
                ));
            }

            if (!targetHostMember) {
                await channels[0].send(trans('model.onDemandVC.transferredProperty', [newHostMember.toString(), currentHostMember.toString()]));
            }
        } catch (exception) {
            Logger.exception(exception);
            await Guild.botChannel.send(
                trans(
                    'model.onDemandVC.errors.propertyTransferFailed',
                    [currentHostMember.toString(), newHostMember.toString()],
                    'en'
                )
            );

            channels.filter(channel => channel !== undefined).forEach(channel => channel.delete());
        }

        return newHostMember;
    },

    /**
     * @param {Array} channels
     * @param {GuildMember} currentHostMember
     * @returns {GuildMember}
     */
    pickNewOwner: (channels, currentHostMember) => {
        const memberPermissionLevels = new Discord.Collection();
        const permissionLevelRoles = Guild.permissionLevels.keyArray().map(roleID => Guild.discordGuild.roles.cache.get(roleID));
        let highestPermissionLevelRole;
        let eligibleMembers = channels[1].members.filter(member => member.id !== currentHostMember.id);
        const eligibleHearingMembers = eligibleMembers.filter(member => !member.voice.deaf);

        if (eligibleHearingMembers.size > 0) {
            eligibleMembers = eligibleHearingMembers;
        }

        eligibleMembers.each(member => {
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

        return highestRankedMembers[Math.floor(Math.random() * highestRankedMembers.length)];
    },

    /**
     * @param {GuildMember} hostMember
     * @param {Array} args
     * @returns {bool}
     */
    setChannelUserLimit: async (hostMember, args) => {
        if (!OnDemandVC.list[hostMember.id]) {
            return false;
        }

        const channels = OnDemandVC.list[hostMember.id].slice(0, 3).map(
            id => Guild.discordGuild.channels.cache.find(channel => channel.id === id)
        );
        const unsetLimitKeywords = ['unset', 'off', 'none', 'remove', 'delete'];

        if (unsetLimitKeywords.includes(args[0])) {
            await channels[1].setUserLimit(0);
            return true;
        }

        const limit = parseInt(args[0]);

        if (args.length !== 1 || isNaN(limit)) {
            await channels[0].send(trans('model.command.onDemandVC.userLimit.incorrectSyntax', [Config.prefix]));
            return false;
        }

        if (channels[2]) {
            await channels[0].send(trans('model.command.onDemandVC.userLimit.wrongAccessLevel'));
            return false;
        }

        if (limit < 0 || limit > 99) {
            await channels[0].send(trans('model.command.onDemandVC.userLimit.invalidLimit'));
            return false;
        }

        await channels[1].setUserLimit(limit);
        return true;
    },

    cleanUnboundChannels: async () => {
        await OnDemandVC.dbSync();

        const channelIDs = Object.values(OnDemandVC.list).map(data => [data[0], data[1], data[2]]).flat();
        const existingChannelIDs = channelIDs.filter(id => Guild.discordGuild.channels.cache.get(id));
        const nonExistingChannelIDs = channelIDs.filter(id => !existingChannelIDs.includes(id));
        const ghostDatabaseEntries = Object.keys(OnDemandVC.list)
            .filter(memberID => OnDemandVC.list[memberID].slice(0, 3).every(channelID => nonExistingChannelIDs.includes(channelID)));

        // Delete orphaned channels (not tracked in the database)
        Guild.smallVoiceCategoryChannel.children
            .filter(channel => channel.id !== Guild.smallVoiceChatRequestChannel.id && !existingChannelIDs.includes(channel.id))
            .map(channel => channel.delete());
        Guild.smallVoiceTextCategoryChannel.children
            .filter(channel => !existingChannelIDs.includes(channel.id))
            .map(channel => channel.delete());

        // Delete ghost channel IDs from the database
        ghostDatabaseEntries.forEach(memberID => OnDemandVC.remove(memberID));
    },

    channelHousekeeping: async () => {
        await OnDemandVC.cleanUnboundChannels();

        const onDemandVCListCopy = {};
        Object.keys(OnDemandVC.list).forEach(memberID => {
            const channelIDs = OnDemandVC.list[memberID].slice(0, 3);
            const channels = [
                Guild.smallVoiceTextCategoryChannel.children.get(channelIDs[0]),
                Guild.smallVoiceCategoryChannel.children.get(channelIDs[1]),
                Guild.smallVoiceCategoryChannel.children.get(channelIDs[2])
            ];

            if (channels.slice(0, 2).every(channel => channel === undefined)) {
                return;
            }

            onDemandVCListCopy[memberID] = channels;
        });

        Object.keys(onDemandVCListCopy).forEach(memberID => {
            const member = Guild.discordGuild.member(memberID);

            OnDemandVC.synchronizeChannels(member, onDemandVCListCopy[memberID]);
            OnDemandVC.pendingLeaveFollowupActions.delete(memberID);
        });
    },

    /**
     * @param {GuildMember} hostMember
     * @param {Array} channels
     */
    synchronizeChannels: async (hostMember, channels) => {
        if (channels[1]) {
            if (channels[1].members.size === 0) {
                // No one left in the voice channel: delete on-demand VC
                OnDemandVC.deletionHandler(hostMember, channels);
            } else {
                let newHostMember = hostMember;

                if (!channels[1].members.has(hostMember.id)) {
                    // Host member left the voice channel: transfer property
                    newHostMember = await OnDemandVC.propertyTransferHandler(channels, hostMember);

                    if (channels[2]) {
                        // Late join request handling of members who joined waiting room during channel synchronization grace period
                        channels[2].members.each(member => OnDemandVC.joinHandler(newHostMember.id, member));
                    }
                }

                OnDemandVC.fixChannelPermissions(newHostMember, channels);
            }
        }
    },

    /**
     * @param {GuildMember} hostMember
     * @param {Array} channels
     */
    fixChannelPermissions: async (hostMember, channels) => {
        if (!channels[2]) {
            channels.filter(channel => channel !== undefined).forEach(channel => channel.lockPermissions());
        } else {
            const outdatedOverwrites = channels[0].permissionOverwrites
                .filter(overwrite => overwrite.type !== 'role' && !channels[1].members.has(overwrite.id));

            await Promise.all([
                ...outdatedOverwrites.map(overwrite => overwrite.delete()),
                channels[0].updateOverwrite(Guild.discordGuild.roles.everyone, {VIEW_CHANNEL: false}),
                ...channels[1].members.map(member => channels[0].updateOverwrite(member, {VIEW_CHANNEL: true})),
                channels[1].updateOverwrite(Guild.discordGuild.roles.everyone, {CONNECT: false}),
                channels[1].updateOverwrite(hostMember, {MOVE_MEMBERS: true}),
                channels[2].updateOverwrite(Guild.discordGuild.roles.everyone, {SPEAK: false, STREAM: false}),
            ]);
        }
    },

    /**
     * @param {Message} message
     * @returns {bool}
     */
    manualChannelTransfer: async (message) => {
        const { certain, foundMembers } = Guild.findDesignatedMemberInMessage(message);

        if (!certain) {
            await message.reply(trans('model.command.onDemandVC.manualTransfer.invalidMemberMentions'));
            return false;
        }

        if (foundMembers.length < 1) {
            await message.reply(trans('model.command.onDemandVC.manualTransfer.noMembersGiven'));
            return false;
        }

        if (foundMembers.length > 1) {
            await message.reply(trans('model.command.onDemandVC.manualTransfer.tooManyMembersGiven'));
            return false;
        }

        const onDemandVCData = OnDemandVC.list[message.member.id];

        if (!onDemandVCData) {
            await message.reply(trans('model.command.onDemandVC.manualTransfer.notOwner'));
            return false;
        }

        const channels = onDemandVCData.slice(0, 3).map(
            id => Guild.discordGuild.channels.cache.find(channel => channel.id === id)
        );

        await OnDemandVC.propertyTransferHandler(channels, message.member, foundMembers[0]);
        return true;
    },

    /**
     * @param {Array} channels
     * @param {GuildMember} newHostMember
     */
    renameTransferredChannels: async (channels, newHostMember) => {
        const renamed = OnDemandVC.list[newHostMember.id][3] === 1;
        if (!renamed) {
            await Promise.all([
                channels[0].setName(newHostMember.displayName),
                channels[1].setName(newHostMember.displayName),
            ]);
        }
    },

    /**
     * @param {GuildMember} hostMember
     * @param {string} name
     */
    renameChannels: async (hostMember, name) => {
        if (!OnDemandVC.list[hostMember.id]) {
            return false;
        }

        const channels = OnDemandVC.list[hostMember.id].slice(0, 3).map(
            id => Guild.discordGuild.channels.cache.find(channel => channel.id === id)
        );

        try {
            OnDemandVC.setRenamed(hostMember.id);
        } catch (exception) {
            Logger.exception(exception);
            await Guild.botChannel.send(trans('model.onDemandVC.errors.renameFailed.mods', [hostMember.toString()], 'en'));
            await channels[0].send(trans('model.onDemandVC.errors.renameFailed.member'));
            return false;
        }

        await Promise.all([
            channels[0].setName(name),
            channels[1].setName(name),
        ]);

        return true;
    },

    /**
     * @param {Array} channels
     * @param {GuildMember} currentHostMember
     * @param {GuildMember} newHostMember
     */
    transferChannelPermissions: async (channels, currentHostMember, newHostMember) => {
        const overwrites = channels[1].permissionOverwrites;
        const hostMemberOverwrite = overwrites.get(currentHostMember.id);

        if (channels[2]) {
            if (hostMemberOverwrite) {
                await Promise.all([
                    hostMemberOverwrite.delete(),
                    channels[1].updateOverwrite(newHostMember, {MOVE_MEMBERS: true}),
                ]);
            } else {
                await channels[1].updateOverwrite(newHostMember, {MOVE_MEMBERS: true});
            }
        }
    },

    /**
     * @param {GuildMember} guestMember
     * @param {Snowflake} requestor
     */
    waitingRoomLeaveHandler: async (guestMember, requestor) => {
        const channels = OnDemandVC.list[requestor].slice(0, 3).map(id => Guild.discordGuild.channels.cache.find(channel => channel.id === id));

        if (channels[1] && OnDemandVC.pendingJoinRequests[channels[1].id]) {
            const message = OnDemandVC.pendingJoinRequests[channels[1].id][guestMember.id];

            await message.delete();
            delete OnDemandVC.pendingJoinRequests[channels[1].id][guestMember.id];
        }
    },
}

module.exports = OnDemandVC;
