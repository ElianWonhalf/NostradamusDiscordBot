const Config = require('../../config.json');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['guillemets'],
    process: async (message) => {
        message.channel.send(trans('model.command.quotes.answer', [], Config.learntLanguagePrefix));
    }
};
