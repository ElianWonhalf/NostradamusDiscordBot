const Logger = require('@elian-wonhalf/pretty-logger');
const Discord = require('discord.js');
const Config = require('../config.json');
const Guild = require('./guild');
const memeURL = 'https://cdn.discordapp.com/attachments/445022429819961344/661313083200897036/497331af-69a6-4007-8411-2b6af7eb6c95.png';
const fiveMinutes = 300000;

const awaitReactions = async (message, expectedEmojis, expectedUserId, callback) => {
    for (const expectedEmoji of expectedEmojis) {
        const emoji = bot.emojis.cache.find(emoji => emoji.name === expectedEmoji);
        await message.react(emoji || expectedEmoji);
    }

    const collector = new Discord.ReactionCollector(
        message,
        (reaction, user) => {
            return expectedEmojis.includes(reaction.emoji.name) && user.id === expectedUserId;
        },
        { time: fiveMinutes, max: 1 }
    );

    collector.once('end', async (reactions) => {
        if (reactions.size > 0) {
            const messageReaction = reactions.first();
            const users = await messageReaction.users.fetch();

            users.delete(bot.user.id);
            callback(messageReaction, await Guild.discordGuild.members.fetch(users.first()));
        }
    });

    Guild.addMemberReactionCollector(expectedUserId, collector);
};

const MemberRolesFlow = {
    canPostMeme: true,

    introduction: (message, member) => {
        awaitReactions(message, ['alogo'], member.id, MemberRolesFlow.start);
    },

    /**
     * @param {MessageReaction} messageReaction
     * @param {GuildMember} member
     */
    start: async (messageReaction, member) => {
        const reply = await Guild.welcomeChannel.send(trans(
            'model.memberRolesFlow.start',
            [member, [Config.learntLanguage]]
        ));
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
                await member.roles.add(Config.roles.native);
                MemberRolesFlow.welcomeMember(member);
                break;

            case notNativeEmojiName:
                await member.roles.add(Config.roles.unknownLevel);
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

        await member.roles.remove(Config.roles.unknownLevel);

        switch (messageReaction.emoji.name) {
            case beginnerEmojiName:
                await member.roles.add(Config.roles.beginner);
                break;

            case intermediateEmojiName:
                await member.roles.add(Config.roles.intermediate);
                break;

            case advancedEmojiName:
                await member.roles.add(Config.roles.advanced);
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

        if (member !== null && !member.roles.cache.has(Config.roles.officialMember)) {
            Guild.stopMemberReactionCollectors(member.id);

            const options = MemberRolesFlow.canPostMeme ? { file: memeURL } : null;

            await message.reply(
                trans('model.memberRolesFlow.noSpeakOnlyAnswer'),
                options
            );

            if (options !== null) {
                MemberRolesFlow.canPostMeme = false;

                setTimeout(() => {
                    MemberRolesFlow.canPostMeme = true;
                }, fiveMinutes);
            }

            if (member.roles.cache.has(Config.roles.unknownLevel)) {
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
        await member.roles.add(Config.roles.officialMember);

        Guild.rolesChannel.send(
            trans('model.memberRolesFlow.validatedMessage', [member])
        );

        const logEmbed = new Discord.MessageEmbed();

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