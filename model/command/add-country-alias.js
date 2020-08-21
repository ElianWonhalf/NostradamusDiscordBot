const Logger = require('@lilywonhalf/pretty-logger');
const Country = require('../country');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class AddCountryAlias
{
    static instance = null;

    constructor() {
        if (AddCountryAlias.instance !== null) {
            return AddCountryAlias.instance;
        }

        this.aliases = ['addcountryalias'];
        this.category = CommandCategory.ADMINISTRATION;
        this.isAllowedForContext = CommandPermission.isMemberModOrSoft;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        args = args.join(' ').split('|');

        const alias = args[0];
        const role = args[1];

        if (Country.getRoleNameFromString(role) !== null) {
            Country.addAlias(alias, role).then(() => {
                message.reply(trans('model.command.addCountryAlias.success', [role], 'en'));
            }).catch(error => {
                Logger.exception(error);
                message.reply(trans('model.command.addCountryAlias.error', [role], 'en'));
            });
        } else {
            message.channel.send(trans('model.command.addCountryAlias.doesNotExist', [role], 'en'));
        }
    }
}

module.exports = new AddCountryAlias();
