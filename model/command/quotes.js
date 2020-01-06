const Config = require('../../config.json');
const CommandCategory = require('../command-category');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['guillemets'],
    category: CommandCategory.MISC,
    process: async (message) => {
        message.channel.send(trans('model.command.quotes.answer', [], Config.learntLanguagePrefix));
    }
};
