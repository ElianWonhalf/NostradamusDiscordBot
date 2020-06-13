const Logger = require('@lilywonhalf/pretty-logger');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['send'],
    category: CommandCategory.BOT_MANAGEMENT,
    isAllowedForContext: CommandPermission.isMemberMod,
    process: async (message, content) => {
        let channel = message.channel;

        if (message.mentions.channels.size > 0) {
            channel = message.mentions.channels.first();
            content.shift();
        }

        const target = await channel.messages.fetch(content.shift());

        target.edit(content.join(' ')).then(async () => {
            await message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollyes'));
        }).catch(async (error) => {
            Logger.error(error.toString());
            await message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollno'));
        });
    }
};
