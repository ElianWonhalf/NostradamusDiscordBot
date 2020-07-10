const Discord = require('discord.js');
const Config = require('../../config.json');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');
const Guild = require('../guild');
const StatMessages = require('../stat-messages');
const StatMemberFlow = require('../stat-member-flow');
const StatVocal = require('../stat-vocal');
const StatInviteLinks = require('../stat-invite-links');
const StatSemiBlacklistTriggers = require('../stat-semi-blacklist-triggers');
const StatFullBlacklistTriggers = require('../stat-full-blacklist-triggers');
const StatProfileChange = require('../stat-profile-change');

const dateFormatOptions = {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
};

/**
 * @param {Snowflake} snowflake
 * @returns {Promise.<string>}
 */
const getJoinedAmount = async (snowflake) => {
    const amount = await StatMemberFlow.getJoinedAmount(snowflake);

    return `${amount} time${amount > 1 ? 's' : ''}`;
};

/**
 * @param {Snowflake} snowflake
 * @returns {Promise.<string>}
 */
const getRecentJoinedAmount = async (snowflake) => {
    const amount = await StatMemberFlow.getJoinedAmount(snowflake, true);

    return `${amount} time${amount > 1 ? 's' : ''}`;
};

/**
 * @param {Snowflake} snowflake
 * @returns {Promise.<string>}
 */
const getPastUsernames = async (snowflake) => {
    const list = await StatProfileChange.getUsernameList(snowflake);
    const listString = list.map(username => `\`${username}\``).join(', ');

    return list.length > 0 ? listString : '*none*';
};

/**
 * @param {Snowflake} snowflake
 * @returns {Promise.<string>}
 */
const getPastNicknames = async (snowflake) => {
    const list = await StatProfileChange.getNicknameList(snowflake);
    const listString = list.map(nickname => `\`${nickname}\``).join(', ');

    return list.length > 0 ? listString : '*none*';
};

/**
 * @param {Snowflake} snowflake
 * @returns {Promise.<string>}
 */
const getBlacklistsTriggerAmounts = async (snowflake) => {
    const fullAmount = await StatFullBlacklistTriggers.getAmount(snowflake);
    const semiAmount = await StatSemiBlacklistTriggers.getAmount(snowflake);

    return `Full: ${fullAmount} - Semi: ${semiAmount}`;
};

/**
 * @param {Snowflake} snowflake
 * @returns {Promise.<string>}
 */
const getRecentBlacklistsTriggerAmounts = async (snowflake) => {
    const fullAmount = await StatFullBlacklistTriggers.getAmount(snowflake, true);
    const semiAmount = await StatSemiBlacklistTriggers.getAmount(snowflake, true);

    return `Full: ${fullAmount} - Semi: ${semiAmount}`;
};

/**
 * @param {GuildMember} member
 * @returns {Promise.<string>}
 */
const getMemberAccountCreationDate = async (member) => {
    const accountCreationDate = member.user.createdAt;
    const elapsedTime = (new Date().getTime() - accountCreationDate.getTime()) / 1000;
    const elapsedTimeString = secondsAmountToDelayString(elapsedTime, 'day');

    return `${accountCreationDate.toLocaleString('fr', dateFormatOptions)} (${elapsedTimeString})`;
};

/**
 * @param {GuildMember} member
 * @returns {Promise.<string>}
 */
const getMemberJoinedDate = async (member) => {
    const firstMessageDate = await StatMessages.getFirstMessageDate(member.id);
    const savedJoinDate = await StatMemberFlow.getFirstJoinedDate(member.id);
    let joinDate = member.joinedAt;
    let prefix = '';

    if (firstMessageDate !== undefined && firstMessageDate.getTime() < joinDate.getTime()) {
        joinDate = firstMessageDate;
        prefix = '≈';
    }

    const joinDateWithoutTime = new Date(joinDate.getTime());
    joinDateWithoutTime.setHours(0);
    joinDateWithoutTime.setMinutes(0);
    joinDateWithoutTime.setSeconds(0);
    joinDateWithoutTime.setMilliseconds(0);

    if (savedJoinDate !== null && savedJoinDate.getTime() < joinDateWithoutTime.getTime()) {
        joinDate = savedJoinDate;
    }

    const elapsedTime = (new Date().getTime() - joinDate.getTime()) / 1000;
    const elapsedTimeString = secondsAmountToDelayString(elapsedTime, 'day');

    return `${prefix}${joinDate.toLocaleString('fr', dateFormatOptions).replace(' à 00:00:00', '')} (${elapsedTimeString})`;
};

class Info
{
    static instance = null;

    constructor() {
        if (Info.instance !== null) {
            return Info.instance;
        }

        this.aliases = ['whois', 'information', 'informations', 'who'];
        this.category = CommandCategory.BOT_MANAGEMENT;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        const result = await Guild.findDesignatedMemberInMessage(message);
        let target = null;

        if (!result.certain && args.length < 1) {
            result.certain = true;
            result.foundMembers.push(await Guild.discordGuild.members.fetch(message.author));
        }

        if (result.certain) {
            try {
                target = await Guild.discordGuild.members.fetch(result.foundMembers[0].id);
            } catch (error) {
                target = null;
            }
        }

        if (target !== null) {
            const suffix = target.nickname !== null && target.nickname !== undefined ? ` aka ${target.nickname}` : '';
            const information = [];
            const data = {
                member: {
                    accountCreated: await getMemberAccountCreationDate(target),
                    memberJoined: await getMemberJoinedDate(target),
                    messagesSent: await StatMessages.getAmount(target.id),
                    vocalTime: secondsAmountToDelayString((await StatVocal.getAmount(target.id)) * 60, 'second', true),
                    memberId: target.id
                },
                mod: {
                    inviteLinks: await StatInviteLinks.getAmount(target.id),
                    triggeredBlacklist: await getBlacklistsTriggerAmounts(target.id),
                    recentlyTriggeredBlacklist: await getRecentBlacklistsTriggerAmounts(target.id),
                    joinedAmount: await getJoinedAmount(target.id),
                    recentlyJoinedAmount: await getRecentJoinedAmount(target.id),
                    usernames: await getPastUsernames(target.id),
                    nicknames: await getPastNicknames(target.id)
                }
            };
            const embed = new Discord.MessageEmbed()
                .setAuthor(
                    `${target.user.username}#${target.user.discriminator}${suffix}`,
                    target.user.displayAvatarURL({ dynamic: true })
                )
                .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
                .setColor(0x00FF00);

            Object.keys(data.member).forEach(datum => {
                const key = trans(`model.command.info.data.${datum}`, [], 'en');
                const value = data.member[datum];

                information.push(`**${key}** ${value}`);
            });

            if (Config.modCategories.includes(message.channel.parentID)) {
                Object.keys(data.mod).forEach(datum => {
                    const key = trans(`model.command.info.data.${datum}`, [], 'en');
                    const value = data.mod[datum];

                    information.push(`**${key}** ${value}`);
                });
            }

            let description = target.toString();

            if (Config.modCategories.includes(message.channel.parentID)) {
                description = `${trans('model.command.info.modIntroduction', [], 'en')}\n\n${description}`;
            }

            description += `\n\n${information.join('\n')}`;

            embed.setDescription(description);
            message.channel.send(embed);
        } else {
            message.reply(trans('model.command.info.notFound'));
        }
    }
}

module.exports = new Info();
