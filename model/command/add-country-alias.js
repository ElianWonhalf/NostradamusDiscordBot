const Logger = require('@lilywonhalf/pretty-logger');
const Country = require('../country');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

/**
 * @param {Message} message
 * @param {Array} args
 */
module.exports = {
    aliases: ['addcountryalias'],
    category: CommandCategory.ADMINISTRATION,
    isAllowedForContext: CommandPermission.isMemberMod,
    process: async (message, args) => {
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
};
