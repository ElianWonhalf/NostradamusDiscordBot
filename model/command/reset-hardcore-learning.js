const Guild = require('../guild');
const HardcoreLearning = require('../hardcore-learning');
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

        HardcoreLearning.reset();
        message.react(emoji);
    }
};
