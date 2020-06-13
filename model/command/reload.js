const Logger = require('@lilywonhalf/pretty-logger');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['reboot'],
    category: CommandCategory.BOT_MANAGEMENT,
    isAllowedForContext: CommandPermission.isMemberMod,
    process: async (message) => {
        await message.reply(trans('model.command.reload.answer', [], 'en'));
        Logger.notice('Reboot asked');
    }
};
