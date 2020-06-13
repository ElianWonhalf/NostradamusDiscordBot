const Logger = require('@lilywonhalf/pretty-logger');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

/**
 * @param {Message} message
 * @param {Array} args
 */
module.exports = {
    aliases: ['setavatar'],
    category: CommandCategory.BOT_MANAGEMENT,
    isAllowedForContext: CommandPermission.isMemberMod,
    process: async (message, args) => {
        global.bot.user.setAvatar(args.join(' ')).then(() => {
            message.reply(trans('model.command.setAvatar.success', [], 'en'))
        }).catch((error) => {
            message.reply(trans('model.command.setAvatar.error', [], 'en'));
            Logger.exception(error);
        });
    }
};
