const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');
const Country = require('../country');

/**
 * @param {Message} message
 * @param {Array} args
 */
module.exports = async (message, args) => {
    const member = Guild.getMemberFromMessage(message);

    if (Guild.isMemberMod(member)) {
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
