const Discord = require('discord.js');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');
const Guild = require('../guild');
const StatMessages = require('../stat-messages');

const getMemberJoinedDate = (member) => {
    return member.joinedAt;
};

const dateFormatOptions = {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
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
            information.push(`**Member joined:** ${getMemberJoinedDate(target).toLocaleString('fr', dateFormatOptions)}`); // @TODO consider older messages, add member age
            information.push(`**Messages sent:** ${await StatMessages.getMessageAmount(target.id)}`);
            information.push(`**Member ID:** ${target.id}`);

            embed.setDescription(information.join('\n'));

            message.channel.send(embed);
        } else {
            message.reply(trans('model.command.info.notFound'));
        }
    }
};
