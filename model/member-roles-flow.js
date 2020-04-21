const Logger = require('@elian-wonhalf/pretty-logger');
const Discord = require('discord.js');
const Config = require('../config.json');
const Guild = require('./guild');
const logoEmojiName = 'alogo';
const nativeEmojiName = '👍';
const notNativeEmojiName = '👎';
const beginnerEmojiName = '🥚';
const intermediateEmojiName = '🐣';
const advancedEmojiName = '🐥';
const nativeStepEmojis = [nativeEmojiName, notNativeEmojiName];
const levelStepEmojis = [beginnerEmojiName, intermediateEmojiName, advancedEmojiName];

const addReactions = async (message, emojis) => {
    for (const expectedEmoji of emojis) {
        const emoji = bot.emojis.cache.find(emoji => emoji.name === expectedEmoji);
        await message.react(emoji || expectedEmoji);
    }
};

const MemberRolesFlow = {
    canPostMeme: true,

    introduction: (message) => {
        addReactions(message, [logoEmojiName]);
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

        await addReactions(reply, nativeStepEmojis);
    },

    /**
     * @param {MessageReaction} messageReaction
     * @param {GuildMember} member
     */
    isNativeStep: async (messageReaction, member) => {
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

        await addReactions(reply, levelStepEmojis);
    },

    /**
     * @param {MessageReaction} messageReaction
     * @param {GuildMember} member
     */
    levelStep: async (messageReaction, member) => {
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
    },

    /**
     * @param {MessageReaction} reaction
     * @param {User} user
     */
    handleReaction: async (reaction, user) => {
        /** {GuildMember} member */
        const member = await Guild.discordGuild.members.fetch(user);
        const userMentions = reaction.message.mentions.users;
        const isWelcomeChannel = reaction.message.channel.id === Config.channels.welcome;
        const validMember = !user.bot && member !== null && !member.roles.cache.has(Config.roles.officialMember);
        const validReaction = userMentions.size > 0 && userMentions.first().id === user.id;

        if (isWelcomeChannel && validMember && validReaction) {
            if (member.roles.cache.has(Config.roles.unknownLevel) && levelStepEmojis.includes(reaction.emoji.name)) {
                MemberRolesFlow.levelStep(reaction, member);
            } else if (member.roles.cache.size < 2 && nativeStepEmojis.includes(reaction.emoji.name)) {
                MemberRolesFlow.isNativeStep(reaction, member);
            } else if (member.roles.cache.size < 2 && reaction.emoji.name === logoEmojiName) {
                MemberRolesFlow.start(reaction, member);
            }
        }
    }
};

module.exports = MemberRolesFlow;