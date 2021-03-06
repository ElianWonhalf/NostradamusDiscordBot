const { MessageEmbed } = require('discord.js');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');
const Guild = require('../guild');

const emojiFoxBottom = bot.emojis.cache.find(emoji => emoji.name === 'foxlong3');
const emojiFoxBody = bot.emojis.cache.find(emoji => emoji.name === 'foxlong2');
const emojiFoxHead = bot.emojis.cache.find(emoji => emoji.name === 'foxlong1');
const emojiLongFox = `${emojiFoxBottom}${emojiFoxBody}${emojiFoxHead}`;

class TokenHelp
{
    static instance = null;

    constructor() {
        if (TokenHelp.instance !== null) {
            return TokenHelp.instance;
        }

        this.aliases = ['tokenhelp', 'thelp'];
        this.category = CommandCategory.FUN;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        const helpEmbed = new MessageEmbed()
            .setColor('#ffb8e6')
            .setTitle(`${emojiLongFox}[Token commands]${emojiLongFox}`)
            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setDescription((trans('model.command.tokenHelp.commandList')))
            .addField('.token-board', (trans('model.command.tokenHelp.commands.tokenBoard')))
            .addField('.token-info', (trans('model.command.tokenHelp.commands.tokenInfo')))
            .addField('.token-help', (trans('model.command.tokenHelp.commands.tokenHelp')))
            .addField('.lucky-fox', (trans('model.command.tokenHelp.commands.luckyFox')))
            .addField('.use-token', (trans('model.command.tokenHelp.commands.tokenUse')))
            .addField(trans('model.command.tokenHelp.announcementsInfo'), `➡${Guild.eventAnnouncementsChannel.toString()}⬅`)
            .setTimestamp(new Date());

        message.channel.send(helpEmbed);
    }
}

module.exports = new TokenHelp();