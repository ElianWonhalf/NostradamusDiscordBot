const Discord = require('discord.js');
const Config = require('../../../config.json');
const CommandPermission = require('../../command-permission');
const Guild = require('../../guild');
const StatMessages = require('../../stat-messages');
const StatMemberFlow = require('../../stat-member-flow');
const StatVocal = require('../../stat-vocal');
const StatInviteLinks = require('../../stat-invite-links');
const StatSemiBlacklistTriggers = require('../../stat-semi-blacklist-triggers');
const StatFullBlacklistTriggers = require('../../stat-full-blacklist-triggers');
const StatProfileChange = require('../../stat-profile-change');

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
 * @returns {Promise.<int>}
 */
const getPastUsernamesNumber = async (snowflake) => {
    return await StatProfileChange.getUsernameCount(snowflake);
};

/**
 * @param {Snowflake} snowflake
 * @returns {Promise.<int>}
 */
const getPastNicknamesNumber = async (snowflake) => {
    return await StatProfileChange.getNicknameCount(snowflake);
};

/**
 * @param {Snowflake} snowflake
 * @returns {Promise.<int>}
 */
const getPastAvatarsNumber = async (snowflake) => {
    return await StatProfileChange.getAvatarCount(snowflake);
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
    const accountCreationDate = member.user ? member.user.createdAt : member.createdAt;
    const elapsedTime = (new Date().getTime() - accountCreationDate.getTime()) / 1000;
    const elapsedTimeString = secondsAmountToDelayString(elapsedTime, 'day');

    return `${accountCreationDate.toLocaleString('fr', DATE_FORMAT_OPTIONS)} (${elapsedTimeString})`;
};

/**
 * @param {GuildMember} member
 * @returns {Promise.<string>}
 */
const getMemberJoinedDate = async (member) => {
    const firstMessageDate = await StatMessages.getFirstMessageDate(member.id);
    const savedJoinDate = await StatMemberFlow.getFirstJoinedDate(member.id);
    let joinDate = member.user ? member.joinedAt : null;
    let prefix = '';

    if (firstMessageDate !== undefined && (joinDate === null || firstMessageDate.getTime() < joinDate.getTime())) {
        joinDate = firstMessageDate;
        prefix = '≈';
    }

    let joinDateWithoutTime = null;

    if (joinDate !== null) {
        joinDateWithoutTime = new Date(joinDate.getTime());
        joinDateWithoutTime.setHours(0);
        joinDateWithoutTime.setMinutes(0);
        joinDateWithoutTime.setSeconds(0);
        joinDateWithoutTime.setMilliseconds(0);
    }

    if (savedJoinDate !== null && (joinDateWithoutTime === null || savedJoinDate.getTime() < joinDateWithoutTime.getTime())) {
        joinDate = savedJoinDate;
    }

    if (joinDate !== null) {
        const elapsedTime = (new Date().getTime() - joinDate.getTime()) / 1000;
        const elapsedTimeString = secondsAmountToDelayString(elapsedTime, 'day');

        return `${prefix}${joinDate.toLocaleString('fr', DATE_FORMAT_OPTIONS).replace(' à 00:00:00', '')} (${elapsedTimeString})`;
    } else {
        return `--`;
    }
};

/**
 * @param {Message} message
 * @param {User|GuildMember} target
 */
module.exports = async (message, target) => {
    if (target === null) {
        message.reply(trans('model.command.info.info.notFound'));
        return;
    }

    const suffix = target.nickname !== null && target.nickname !== undefined ? ` aka ${target.nickname}` : '';
    const information = [];
    const user = target.user ? target.user : target;
    const customStatus = user.presence !== undefined
        ? user.presence.activities.find(activity => activity.type === 'CUSTOM_STATUS')
        : undefined;

    const data = {
        member: {
            accountCreated: await getMemberAccountCreationDate(target),
            memberJoined: await getMemberJoinedDate(target),
            messagesSent: await StatMessages.getAmount(target.id),
            vocalTime: secondsAmountToDelayString((await StatVocal.getAmount(target.id)) * 60, 'second', true),
            memberId: target.id,
            customStatus: customStatus ? customStatus.state : '-'
        },
        mod: {
            inviteLinks: await StatInviteLinks.getAmount(target.id),
            triggeredBlacklist: await getBlacklistsTriggerAmounts(target.id),
            recentlyTriggeredBlacklist: await getRecentBlacklistsTriggerAmounts(target.id),
            joinedAmount: await getJoinedAmount(target.id),
            recentlyJoinedAmount: await getRecentJoinedAmount(target.id),
            usernames: await getPastUsernamesNumber(target.id),
            nicknames: await getPastNicknamesNumber(target.id),
            avatars: await getPastAvatarsNumber(target.id)
        }
    };
    const colour = target.user ? 0x00FF00 : 0xFF0000;
    const embed = new Discord.MessageEmbed()
        .setAuthor(
            `${user.username}#${user.discriminator}${suffix}`,
            user.displayAvatarURL({ dynamic: true })
        )
        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
        .setColor(colour);

    Object.keys(data.member).forEach(datum => {
        const key = trans(`model.command.info.data.${datum}`, [], 'en');
        const value = data.member[datum];

        information.push(`**${key}** ${value}`);
    });

    if (Config.channelCategories.mod.includes(message.channel.parentID) && await CommandPermission.isMemberModOrSoftOrTutor(message)) {
        Object.keys(data.mod).forEach(datum => {
            const key = trans(`model.command.info.data.${datum}`, [], 'en');
            const value = data.mod[datum];

            information.push(`**${key}** ${value}`);
        });
    }

    let description = target.toString();

    if (Config.channelCategories.mod.includes(message.channel.parentID) && await CommandPermission.isMemberModOrSoftOrTutor(message)) {
        description = `${trans('model.command.info.modIntroduction', [], 'en')}\n\n${description}`;
    }

    if (target.user) {
        const roles = target.roles.cache.filter(
            role => role.id !== Guild.discordGuild.roles.everyone.id
        ).array().join(' ');

        description = `${description}\n\n${roles}`;
    }

    description += `\n\n${information.join('\n')}`;

    embed.setDescription(description);
    message.channel.send(embed);
};
