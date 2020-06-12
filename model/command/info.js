const Discord = require('discord.js');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');
const Guild = require('../guild');
const StatMessages = require('../stat-messages');
const StatMemberFlow = require('../stat-member-flow');
const StatVocal = require('../stat-vocal');
const StatInviteLinks = require('../stat-invite-links');

const dateFormatOptions = {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
};

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

    return `${prefix}${joinDate.toLocaleString('fr', dateFormatOptions).replace(' à 00:00:00', '')}`;
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

        if (!result.certain && args.length < 1) {
            result.certain = true;
            result.foundMembers.push(await Guild.discordGuild.members.fetch(message.author));
        }

        if (result.certain) {
            const target = await Guild.discordGuild.members.fetch(result.foundMembers[0].id);
            const suffix = target.nickname !== null && target.nickname !== undefined ? ` aka ${target.nickname}` : '';
            const information = [];
            const embed = new Discord.MessageEmbed()
                .setAuthor(
                    `${target.user.username}#${target.user.discriminator}${suffix}`,
                    target.user.displayAvatarURL({ dynamic: true })
                )
                .setThumbnail(target.user.displayAvatarURL({ dynamic: true }))
                .setColor(0x00FF00);

            information.push(`**Account created:** ${target.user.createdAt.toLocaleString('fr', dateFormatOptions)}`); // @TODO add account age
            information.push(`**Member joined:** ${await getMemberJoinedDate(target)}`); // @TODO add member age
            information.push(`**Messages sent:** ${await StatMessages.getAmount(target.id)}`);
            information.push(`**Time spent in vocal:** ${secondsAmountToDelayString((await StatVocal.getAmount(target.id)) * 60)}`);
            information.push(`**Member ID:** ${target.id}`);
            information.push(`**Invite links:** ${await StatInviteLinks.getAmount(target.id)}`);

            embed.setDescription(information.join('\n'));

            message.channel.send(embed);
        } else {
            message.reply(trans('model.command.info.notFound'));
        }
    }
};
