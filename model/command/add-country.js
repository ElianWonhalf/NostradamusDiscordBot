const Logger = require('@lilywonhalf/pretty-logger');
const Guild = require('../guild');
const Country = require('../country');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

/**
 * @param {Message} message
 * @param {Array} args
 */
module.exports = {
    aliases: ['addcountry'],
    category: CommandCategory.ADMINISTRATION,
    isAllowedForContext: CommandPermission.isMemberMod,
    process: async (message, args) => {
        args = args.join(' ').split('|');

        const friendly = args[0];
        const role = args[1];

        if (!message.guild.roles.cache.find(guildRole => guildRole.name === role)) {
            Guild.createRole(role)
                .then(roleInstance => {
                    message.reply(trans('model.command.addCountry.discordRoleAddSuccess', [roleInstance], 'en'));

                    // then add to database
                    Country.add(friendly, role).then(() => {
                        message.reply(trans('model.command.addCountry.databaseRoleAddSuccess', [role], 'en'));
                    }).catch(error => {
                        Logger.exception(error);
                        message.reply(trans('model.command.addCountry.databaseRoleAddError', [role], 'en'));
                    });
                }).catch(error => {
                    Logger.exception(error);
                    message.reply(trans('model.command.addCountry.discordRoleAddError', [role], 'en'));
                });
        } else {
            message.channel.send(trans('model.command.addCountry.alreadyExists', [role], 'en'));
        }
    }
};
