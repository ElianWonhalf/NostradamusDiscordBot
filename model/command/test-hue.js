const Hue = require('../hue');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['getunassignedroles', 'get-unassigned-role', 'getunassignedrole', 'gur'],
    category: CommandCategory.ADMINISTRATION,
    isAllowedForContext: CommandPermission.isMommy,
    process: async (message) => {
        const emoji = bot.emojis.cache.find(emoji => emoji.name === 'eowynsheep');

        await Hue.flash();
        await message.react(emoji);
    }
};
