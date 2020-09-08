const Logger = require('@lilywonhalf/pretty-logger');
const Discord = require('discord.js');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class DM
{
    static instance = null;

    constructor() {
        if (DM.instance !== null) {
            return DM.instance;
        }

        this.aliases = ['dmreply', 'dm-reply', 'mp'];
        this.category = CommandCategory.MODERATION;
        this.isAllowedForContext = CommandPermission.isMemberModOrSoft;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        args.shift(); // Remove the recipient

        if (args.length > 0) {
            const answer = args.join(' ');
            const { certain, foundMembers } = Guild.findDesignatedMemberInMessage(message);

            if (certain && foundMembers.length > 0) {
                const embed = await Guild.messageToEmbed(message);

                embed.setDescription(answer);
                embed.setTimestamp(message.createdTimestamp);

                foundMembers[0].send({
                    embed: embed,
                    files: message.attachments.map(messageAttachment => {
                        return new Discord.MessageAttachment(messageAttachment.url, messageAttachment.filename);
                    })
                }).then(() => {
                    const emoji = bot.emojis.cache.find(emoji => emoji.name === 'pollyes');
                    message.react(emoji);
                }).catch((exception) => {
                    const emoji = bot.emojis.cache.find(emoji => emoji.name === 'pollno');

                    message.react(emoji);
                    Logger.exception(exception);
                });
            } else {
                message.reply(trans('model.command.dm.notFound', [], 'en'));
            }
        } else {
            message.reply(trans('model.command.dm.noMessage', [], 'en'));
        }
    }
}

module.exports = new DM();
