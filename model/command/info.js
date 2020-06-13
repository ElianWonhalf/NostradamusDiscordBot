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

    if (firstMessageDate.getTime() < joinDate.getTime()) {
        joinDate = firstMessageDate;
        prefix = '≈';
    }

    if (savedJoinDate !== null && savedJoinDate.getTime() < joinDate.getTime()) {
        joinDate = savedJoinDate;
    }

    const elapsedTime = (new Date().getTime() - joinDate.getTime()) / 1000;
    const elapsedTimeString = secondsAmountToDelayString(elapsedTime, 'day');

    return `${prefix}${joinDate.toLocaleString('fr', dateFormatOptions).replace(' à 00:00:00', '')} (${elapsedTimeString})`;
};

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['whois', 'information', 'informations', 'who'],
    category: CommandCategory.BOT_MANAGEMENT,
    isAllowedForContext: CommandPermission.notInWelcome,
    process: async (message, args) => {
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
            const embed = new Discord.MessageEmbed()
                .setAuthor(
                    `${target.user.username}#${target.user.discriminator}${suffix}`,
                    target.user.displayAvatarURL({ dynamic: true })
                )
                .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
                .setColor(0x00FF00);

            information.push(`**Account created:** ${await getMemberAccountCreationDate(target)}`);
            information.push(`**Member joined:** ${await getMemberJoinedDate(target)}`);
            information.push(`**Messages sent:** ${await StatMessages.getAmount(target.id)}`);
            information.push(`**Time spent in vocal:** ${secondsAmountToDelayString((await StatVocal.getAmount(target.id)) * 60)}`);
            information.push(`**Member ID:** ${target.id}`);

            if (Config.modCategories.includes(message.channel.parentID)) {
                information.push(`**Invite links:** ${await StatInviteLinks.getAmount(target.id)}`);
                information.push(`**Triggered blacklist:** ${await getBlacklistsTriggerAmounts(target.id)}`);
                information.push(`**Recently triggered blacklist:** ${await getRecentBlacklistsTriggerAmounts(target.id)}`);
                information.push(`**Past usernames:** ${await getPastUsernames(target.id)}`);
                information.push(`**Past nicknames:** ${await getPastNicknames(target.id)}`);
            }

            embed.setDescription(information.join('\n'));

            message.channel.send(embed);
        } else {
            message.reply(trans('model.command.info.notFound'));
        }
    }
};
