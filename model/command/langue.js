const Config = require('../../config.json');
const CommandCategory = require('../command-category');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['langue', 'langues'],
    category: CommandCategory.RESOURCE,
    process: async (message) => {
        message.channel.send(trans('model.command.langue.reply'));
    }
};
