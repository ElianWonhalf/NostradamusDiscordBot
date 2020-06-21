const Logger = require('@lilywonhalf/pretty-logger');
const Discord = require('discord.js');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class Quote
{
    static instance = null;

    constructor() {
        if (Quote.instance !== null) {
            return Quote.instance;
        }

        this.aliases = [];
        this.category = CommandCategory.BOT_MANAGEMENT;
        this.isAllowedForContext = CommandPermission.isMemberMod;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        let member = await Guild.getMemberFromMessage(message);

        if (message.mentions.members.size > 0) {
            member = message.mentions.members.first();
            args.shift();
        }

        const embed = new Discord.MessageEmbed()
            .setAuthor(
                `${member.displayName}`,
                member.user.displayAvatarURL({ dynamic: true })
            )
            .setColor(0x00FF00)
            .setDescription(args.join(' '));

        message.channel.send(embed).then(async () => {
            await message.delete();
        }).catch(async (error) => {
            Logger.error(error.toString());
            await message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollno'));
        });
    }
}

module.exports = new Quote();
