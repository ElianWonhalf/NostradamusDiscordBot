const Logger = require('@elian-wonhalf/pretty-logger');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: [],
    category: CommandCategory.BOT_MANAGEMENT,
    isAllowedForContext: CommandPermission.isMemberMod,
    process: async (message) => {
        const emoji = bot.emojis.cache.find(emoji => emoji.name === 'eowynsheep');

        await message.react(emoji);
        Logger.notice('killnostrapls');
    }
};
