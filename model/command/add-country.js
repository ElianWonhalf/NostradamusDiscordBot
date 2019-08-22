const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');
const Country = require('../country');

/**
 * @param {Message} message
 * @param {Array} args
 */
module.exports = {
    aliases: ['addcountry'],
    process: async (message, args) => {
        const member = Guild.getMemberFromMessage(message);

        if (Guild.isMemberMod(member)) {
            args = args.join(' ').split('|');

            const friendly = args[0];
            const role = args[1];

            if (!message.guild.roles.find(guildRole => guildRole.name === role)) {
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
    }
};
