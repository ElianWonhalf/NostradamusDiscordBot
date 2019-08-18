const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');
const Language = require('../language');
const Country = require('../country');

/**
 * @param {Message} message
 * @param {Array} args
 */
module.exports = async (message, args) => {
    const member = Guild.getMemberFromMessage(message);

    if (Guild.isMemberMod(member)) {
        const dryRun = args[0] === 'dry';
        let amountRolesCreated = 0;

        for (let i = 0; i < Language.list.length; i++) {
            if (!message.guild.roles.find(role => role.name === Language.list[i].role)) {
                amountRolesCreated++;

                if (dryRun) {
                    message.reply(trans('model.command.loadRoles.dryRoleCreation', [Language.list[i].role], 'en'));
                } else {
                    Guild.createRole(Language.list[i].role)
                        .then(role => message.reply(trans('model.command.loadRoles.roleCreation', [role], 'en')))
                        .catch(Logger.exception)
                }
            }
        }

        for (let i = 0; i < Country.list.length; i++) {
            if (!message.guild.roles.find(role => role.name === Country.list[i].role)) {
                amountRolesCreated++;

                if (dryRun) {
                    message.reply(trans('model.command.loadRoles.dryRoleCreation', [Country.list[i].role], 'en'));
                } else {
                    Guild.createRole(Country.list[i].role)
                    .then(role => message.reply(trans('model.command.loadRoles.dryRoleCreation', [role], 'en')))
                    .catch(Logger.exception)
                }
            }
        }

        message.reply(trans('model.command.loadRoles.count', [amountRolesCreated], 'en'));
    }
};
