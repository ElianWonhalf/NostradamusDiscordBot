const Discord = require('discord.js');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class GetMemberId
{
    static instance = null;

    constructor() {
        if (GetMemberId.instance !== null) {
            return GetMemberId.instance;
        }

        this.aliases = ['getmemberid', 'getuserid', 'memberid', 'userid', 'gmid', 'guid'];
        this.category = CommandCategory.MODERATION;
        this.isAllowedForContext = CommandPermission.isMemberModOrSoft;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        const result = Guild.findDesignatedMemberInMessage(message);

        if (result.foundMembers.length > 0) {
            result.foundMembers.slice(0, 5).forEach(async member => {
                const embed = new Discord.MessageEmbed().setAuthor(
                    `${member.user.username}#${member.user.discriminator}`,
                    member.user.displayAvatarURL({ dynamic: true })
                ).setDescription(`ID: ${member.id}`);
                await message.channel.send(embed);
            });
        } else {
            message.reply(trans('model.command.getMemberId.notFound', [], 'en'));
        }
    }
}

module.exports = new GetMemberId();
