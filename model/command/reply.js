const Logger = require('@lilywonhalf/pretty-logger');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: [],
    category: CommandCategory.FUN,
    isAllowedForContext: CommandPermission.notInWelcome,
    process: async (message) => {
        message.delete().catch(Logger.exception);
        message.channel.send(
            trans(
                `model.command.reply.${Math.random() < 0.92 ? 'calisse' : 'tabarnak'}`,
                [],
                'fr'
            )
        );
    }
};
