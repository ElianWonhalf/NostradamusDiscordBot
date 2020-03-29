const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');
const CommandCategory = require('../command-category');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: [],
    category: CommandCategory.BOT_MANAGEMENT,
    process: async (message) => {
        const member = await Guild.getMemberFromMessage(message);

        if (Guild.isMemberMod(member)) {
            const emoji = bot.emojis.cache.find(emoji => emoji.name === 'eowynsheep');

            await message.react(emoji);
            Logger.notice('killnostrapls');
        }
    }
};
