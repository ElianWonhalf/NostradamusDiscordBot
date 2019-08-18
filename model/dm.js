const Logger = require('@elian-wonhalf/pretty-logger');
const Discord = require('discord.js');
const EventBus = require('./events-bus');
const Guild = require('./guild');

const SemiBlacklist = {
    ignoredUserDMs: [],

    init: () => {
        EventBus.subscribe('member.ignoreDMStart', (member) => {
            if (SemiBlacklist.ignoredUserDMs.indexOf(member.user.id) < 0) {
                SemiBlacklist.ignoredUserDMs.push(member.user.id);
            }
        });

        EventBus.subscribe('member.ignoreDMEnd', (member) => {
            if (SemiBlacklist.ignoredUserDMs.indexOf(member.user.id) > -1) {
                SemiBlacklist.ignoredUserDMs = SemiBlacklist.ignoredUserDMs.filter(
                    id => id !== member.user.id
                );
            }
        });
    },

    /**
     * @param {Message} message
     * @param {boolean} isCommand
     */
    parseMessage: async (message, isCommand) => {
        if (message.guild === null && !isCommand && SemiBlacklist.ignoredUserDMs.indexOf(message.author.id) < 0) {
            Guild.botChannel.send(
                trans('model.dm.notification', [message.author, message.content], 'en'),
                {
                    files: message.attachments.map(messageAttachment => {
                        return new Discord.Attachment(messageAttachment.url, messageAttachment.filename);
                    })
                }
            ).catch(Logger.exception);
        }
    },
};

module.exports = SemiBlacklist;
