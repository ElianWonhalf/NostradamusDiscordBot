const Logger = require('@elian-wonhalf/pretty-logger');
const Discord = require('discord.js');
const Config = require('../config.json');
const Guild = require('./guild');

const SemiBlacklist = {
    ignoredUserDMs: [],

    init: () => {
        Guild.events.on('member.ignoreDMStart', (member) => {
            if (!SemiBlacklist.ignoredUserDMs.includes(member.user.id)) {
                SemiBlacklist.ignoredUserDMs.push(member.user.id);
            }
        });

        Guild.events.on('member.ignoreDMEnd', (member) => {
            const idx = SemiBlacklist.ignoredUserDMs.findIndex(id => id === member.user.id);
            if (idx >= 0) SemiBlacklist.ignoredUserDMs.splice(idx, 1);
        });
    },

    /**
     * @param {Message} message
     * @param {boolean} isCommand
     */
    parseMessage: async (message, isCommand) => {
        if (message.guild === null && !isCommand && !SemiBlacklist.ignoredUserDMs.includes(message.author.id)) {
            const embed = await Guild.messageToEmbed(message);

            embed.setFooter(`${Config.prefix}dmreply ${message.author.id}`);

            Guild.botChannel.send(
                trans('model.dm.notification', [message.author], 'en'),
                {
                    embed: embed,
                    files: message.attachments.map(messageAttachment => {
                        return new Discord.Attachment(messageAttachment.url, messageAttachment.filename);
                    })
                }
            ).then(() => {
                const emoji = bot.emojis.find(emoji => emoji.name === 'pollyes');
                message.react(emoji);
            }).catch((exception) => {
                const emoji = bot.emojis.find(emoji => emoji.name === 'pollno');

                message.react(emoji);
                Logger.exception(exception);
            });
        }
    },
};

module.exports = SemiBlacklist;
