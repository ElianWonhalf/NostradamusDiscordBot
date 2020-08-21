const Logger = require('@lilywonhalf/pretty-logger');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class SetAvatar
{
    static instance = null;

    constructor() {
        if (SetAvatar.instance !== null) {
            return SetAvatar.instance;
        }

        this.aliases = ['setavatar'];
        this.category = CommandCategory.BOT_MANAGEMENT;
        this.isAllowedForContext = CommandPermission.isMommy;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        bot.user.setAvatar(args.join(' ')).then(() => {
            message.reply(trans('model.command.setAvatar.success', [], 'en'))
        }).catch((error) => {
            message.reply(trans('model.command.setAvatar.error', [], 'en'));
            Logger.exception(error);
        });
    }
}

module.exports = new SetAvatar();
