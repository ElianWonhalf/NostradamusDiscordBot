const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['send'],
    process: async (message, content) => {
        const member = await Guild.getMemberFromMessage(message);

        if (Guild.isMemberMod(member)) {
            let channel = message.channel;

            if (message.mentions.channels.size > 0) {
                channel = message.mentions.channels.first();
                content.shift();
            }

            channel.send(content.join(' ')).then(() => {
                message.react(bot.emojis.find(emoji => emoji.name === 'pollyes'));
            }).catch((error) => {
                Logger.error(error.toString());
                message.react(bot.emojis.find(emoji => emoji.name === 'pollno'));
            });
        }
    }
};
