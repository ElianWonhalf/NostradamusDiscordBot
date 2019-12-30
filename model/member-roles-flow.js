const Logger = require('@elian-wonhalf/pretty-logger');
const Discord = require('discord.js');
const Config = require('../config.json');
const Guild = require('./guild');

const awaitReactions = async (message, expectedEmojis, expectedUserId, callback) => {
    for (const expectedEmoji of expectedEmojis) {
        const emoji = bot.emojis.find(emoji => emoji.name === expectedEmoji);
        await message.react(emoji || expectedEmoji);
    }

    // 5 minutes
    const collector = new Discord.ReactionCollector(
        message,
        (reaction, user) => {
            return expectedEmojis.includes(reaction.emoji.name) && user.id === expectedUserId;
        },
        { time: 300000, max: 1 }
    );

    collector.once('end', async (reactions) => {
        if (reactions.size > 0) {
            const messageReaction = reactions.first();
            const users = await messageReaction.fetchUsers();

            users.delete(bot.user.id);
            callback(messageReaction, await Guild.discordGuild.fetchMember(users.first()));
        }
    });

    Guild.addMemberReactionCollector(expectedUserId, collector);
};

const MemberRolesFlow = {
    introduction: (message, member) => {
        awaitReactions(message, ['alogo'], member.id, MemberRolesFlow.start);
    },

    /**
     * @param {MessageReaction} messageReaction
     * @param {GuildMember} member
     */
    start: async (messageReaction, member) => {
        const reply = await Guild.welcomeChannel.send(trans('model.memberRolesFlow.start', [member]));
        await awaitReactions(reply, ['👍', '👎'], member.id, MemberRolesFlow.isNativeStep);
    },

    /**
     * @param {MessageReaction} messageReaction
     * @param {GuildMember} member
     */
    isNativeStep: async (messageReaction, member) => {
        const nativeEmojiName = '👍';
        const notNativeEmojiName = '👎';

        switch (messageReaction.emoji.name) {
            case nativeEmojiName:
                await member.addRole(Config.roles.native);
                MemberRolesFlow.welcomeMember(member);
                break;

            case notNativeEmojiName:
                await member.addRole(Config.roles.unknownLevel);
                MemberRolesFlow.levelStepMessage(member);
                break;

            default:
                Logger.error('THIS SHOULD NOT HAPPEN, WE HAVE TO TELL ANDY D: !');
                break;
        }
    },

    /**
     * @param {GuildMember} member
     */
    levelStepMessage: async (member) => {
        const reply = await Guild.welcomeChannel.send(
            trans(
                'model.memberRolesFlow.levelStep',
                [
                    ['model.memberRolesFlow.levelStepTitle', [member, [Config.learntLanguage]]],
                    ['model.memberRolesFlow.levelStepBeginner'],
                    ['model.memberRolesFlow.levelStepIntermediate'],
                    ['model.memberRolesFlow.levelStepAdvanced'],
                ]
            )
        );

        await awaitReactions(reply, ['🥚', '🐣', '🐥'], member.id, MemberRolesFlow.levelStep);
    },

    /**
     * @param {MessageReaction} messageReaction
     * @param {GuildMember} member
     */
    levelStep: async (messageReaction, member) => {
        const beginnerEmojiName = '🥚';
        const intermediateEmojiName = '🐣';
        const advancedEmojiName = '🐥';

        await member.removeRole(Config.roles.unknownLevel);

        switch (messageReaction.emoji.name) {
            case beginnerEmojiName:
                await member.addRole(Config.roles.beginner);
                break;

            case intermediateEmojiName:
                await member.addRole(Config.roles.intermediate);
                break;

            case advancedEmojiName:
                await member.addRole(Config.roles.advanced);
                break;

            default:
                Logger.error('THIS SHOULD NOT HAPPEN, WE HAVE TO TELL ANDY D: !');
                break;
        }

        MemberRolesFlow.welcomeMember(member);
    },

    /**
     * @param {Message} message
     */
    parse: async (message) => {
        /** {GuildMember} member */
        const member = await Guild.getMemberFromMessage(message);

        if (member !== null && !member.roles.has(Config.roles.officialMember)) {
            if (member.roles.has(Config.roles.unknownLevel)) {
                MemberRolesFlow.levelStepMessage(await Guild.getMemberFromMessage(message));
            } else {
                MemberRolesFlow.start(null, await Guild.getMemberFromMessage(message));
            }
        }
    },

    /**
     * @param {GuildMember} member
     */
    welcomeMember: async (member) => {
        await member.addRole(Config.roles.officialMember);

        Guild.rolesChannel.send(
            trans('model.memberRolesFlow.validatedMessage', [member])
        );

        const logEmbed = new Discord.RichEmbed();

        logEmbed.setColor('#ffb8e6');
        logEmbed.setAuthor(trans('model.memberRolesFlow.logTitle', [], 'en'), member.user.displayAvatarURL);
        logEmbed.setDescription(`${member} ${member.displayName}#${member.user.discriminator}`);
        logEmbed.setThumbnail(member.user.displayAvatarURL);
        logEmbed.setFooter(trans('model.memberRolesFlow.logFooter', [member.id], 'en'));
        logEmbed.setTimestamp(new Date());

        Guild.memberFlowLogChannel.send(logEmbed);
    }
};

module.exports = MemberRolesFlow;