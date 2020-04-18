const Config = require('../../config.json');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['guillemets'],
    category: CommandCategory.RESOURCE,
    isAllowedForContext: CommandPermission.notInWelcome,
    process: async (message) => {
        message.channel.send(trans('model.command.quotes.answer', [], Config.learntLanguagePrefix));
    }
};
