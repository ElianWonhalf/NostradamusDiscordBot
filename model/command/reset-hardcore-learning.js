const Guild = require('../guild');
const HardcoreLearning = require('../hardcore-learning');
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

            HardcoreLearning.reset();
            message.react(emoji);
        }
    }
};
