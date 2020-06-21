const Logger = require('@lilywonhalf/pretty-logger');
const Language = require('../language');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class AddLanguageAlias
{
    static instance = null;

    constructor() {
        if (AddLanguageAlias.instance !== null) {
            return AddLanguageAlias.instance;
        }

        this.aliases = ['addlanguagealias'];
        this.category = CommandCategory.ADMINISTRATION;
        this.isAllowedForContext = CommandPermission.isMemberMod;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        args = args.join(' ').split('|');

        const alias = args[0];
        const role = args[1];

        if (Language.getRoleNameFromString(role) !== null) {
            Language.addAlias(alias, role).then(() => {
                message.reply(trans('model.command.addLanguageAlias.success', [role], 'en'));
            }).catch(error => {
                Logger.exception(error);
                message.reply(trans('model.command.addLanguageAlias.error', [role], 'en'));
            });
        } else {
            message.channel.send(trans('model.command.addLanguageAlias.doesNotExist', [role], 'en'));
        }
    }
}

module.exports = new AddLanguageAlias();
