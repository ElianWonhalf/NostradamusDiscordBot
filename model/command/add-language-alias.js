const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');
const Language = require('../language');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

/**
 * @param {Message} message
 * @param {Array} args
 */
module.exports = {
    aliases: ['addlanguagealias'],
    category: CommandCategory.ADMINISTRATION,
    isAllowedForContext: CommandPermission.isMemberMod,
    process: async (message, args) => {
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
};
