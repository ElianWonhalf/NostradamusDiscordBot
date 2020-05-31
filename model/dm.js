const Logger = require('@elian-wonhalf/pretty-logger');
const Discord = require('discord.js');
const Config = require('../config.json');
const Guild = require('./guild');

const DM = {
    ignoredUserDMs: [],

    init: () => {
        Guild.events.on('member.ignoreDMStart', (member) => {
            if (!DM.ignoredUserDMs.includes(member.user.id)) {
                DM.ignoredUserDMs.push(member.user.id);
            }
        });

        Guild.events.on('member.ignoreDMEnd', (member) => {
            const idx = DM.ignoredUserDMs.findIndex(id => id === member.user.id);
            if (idx >= 0) DM.ignoredUserDMs.splice(idx, 1);
        });
    },

    /**
     * @param {Message} message
     * @param {boolean} isCommand
     */
    parseMessage: async (message, isCommand) => {
        const isMom = message.author.id === Config.admin;

        if (message.guild === null && !isMom && !isCommand && !DM.ignoredUserDMs.includes(message.author.id)) {
            const embed = await Guild.messageToEmbed(message);

            embed.setFooter(`${Config.prefix}dmreply ${message.author.id}`);

            Guild.modDMsChannel.send(
                trans('model.dm.notification', [message.author], 'en'),
                {
                    embed: embed,
                    files: message.attachments.map(messageAttachment => {
                        return new Discord.MessageAttachment(messageAttachment.url, messageAttachment.filename);
                    })
                }
            ).then(() => {
                const emoji = bot.emojis.cache.find(emoji => emoji.name === 'pollyes');
                message.react(emoji);
            }).catch((exception) => {
                const emoji = bot.emojis.cache.find(emoji => emoji.name === 'pollno');

                message.react(emoji);
                Logger.exception(exception);
            });
        }
    },
};

module.exports = DM;
