const Logger = require('@lilywonhalf/pretty-logger');
const Discord = require('discord.js');
const Config = require('../config.json');
const Guild = require('./guild');
const StatMemberFlow = require('./stat-member-flow');

const POSSIBLE_TROLL_DELAY = 10 * 1000;
const LOGO_EMOJI_NAME = 'alogo';
const NATIVE_EMOJI_NAME = '👍';
const NOT_NATIVE_EMOJI_NAME = '👎';
const BEGINNER_EMOJI_NAME = '🥚';
const INTERMEDIATE_EMOJI_NAME = '🐣';
const ADVANCED_EMOJI_NAME = '🐥';

const nativeStepEmojis = [NATIVE_EMOJI_NAME, NOT_NATIVE_EMOJI_NAME];
const levelStepEmojis = [BEGINNER_EMOJI_NAME, INTERMEDIATE_EMOJI_NAME, ADVANCED_EMOJI_NAME];
const memberTime = {};

const addReactions = async (message, emojis) => {
    for (const expectedEmoji of emojis) {
        const emoji = bot.emojis.cache.find(emoji => emoji.name === expectedEmoji);
        await message.react(emoji || expectedEmoji);
    }
};

const MemberRolesFlow = {
    canPostMeme: true,

    introduction: (message) => {
        addReactions(message, [LOGO_EMOJI_NAME]);
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

        memberTime[member.id] = new Date().getTime();
        await addReactions(reply, nativeStepEmojis);
    },

    /**
     * @param {MessageReaction} messageReaction
     * @param {GuildMember} member
     */
    isNativeStep: async (messageReaction, member) => {
        switch (messageReaction.emoji.name) {
            case NATIVE_EMOJI_NAME:
                await member.roles.add(Config.roles.native);
                MemberRolesFlow.welcomeMember(member);
                break;

            case NOT_NATIVE_EMOJI_NAME:
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
            case BEGINNER_EMOJI_NAME:
                await member.roles.add(Config.roles.beginner);
                break;

            case INTERMEDIATE_EMOJI_NAME:
                await member.roles.add(Config.roles.intermediate);
                break;

            case ADVANCED_EMOJI_NAME:
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

        StatMemberFlow.save(member.id, StatMemberFlow.constructor.MEMBER_FLOW_EVENT_VALIDATED);

        const logEmbed = new Discord.MessageEmbed();

        logEmbed.setColor('#ffb8e6');
        logEmbed.setAuthor(trans('model.memberRolesFlow.logTitle', [], 'en'), member.user.displayAvatarURL({ dynamic: true }));
        logEmbed.setDescription(`${member} ${member.displayName}#${member.user.discriminator}`);
        logEmbed.setThumbnail(member.user.displayAvatarURL({ dynamic: true }));
        logEmbed.setFooter(trans('model.memberRolesFlow.logFooter', [member.id], 'en'));
        logEmbed.setTimestamp(new Date());

        Guild.memberFlowLogChannel.send(logEmbed);

        if (new Date().getTime() - memberTime[member.id] < POSSIBLE_TROLL_DELAY) {
            Guild.automodChannel.send(trans('model.memberRolesFlow.possibleTroll', [member.toString()], 'en'));
        }
    },

    /**
     * @param {MessageReaction} reaction
     * @param {User} user
     */
    handleReaction: async (reaction, user) => {
        /** {GuildMember} member */
        const member = await Guild.discordGuild.members.fetch(user);
        const isWelcomeChannel = reaction.message.channel.id === Config.channels.welcome;
        const validMember = !user.bot && member !== null && !member.roles.cache.has(Config.roles.officialMember);

        if (isWelcomeChannel && validMember) {
            if (member.roles.cache.has(Config.roles.unknownLevel) && levelStepEmojis.includes(reaction.emoji.name)) {
                MemberRolesFlow.levelStep(reaction, member);
            } else if (member.roles.cache.size < 2 && nativeStepEmojis.includes(reaction.emoji.name)) {
                MemberRolesFlow.isNativeStep(reaction, member);
            } else if (member.roles.cache.size < 2 && reaction.emoji.name === LOGO_EMOJI_NAME) {
                MemberRolesFlow.start(reaction, member);
            }
        }
    }
};

module.exports = MemberRolesFlow;