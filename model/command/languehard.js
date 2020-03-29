const CommandCategory = require('../command-category');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['languedifficile', 'hardlanguage', 'languagehard'],
    category: CommandCategory.RESOURCE,
    process: async (message) => {
        message.channel.send(trans('model.command.langue.reply'));
    }
};
