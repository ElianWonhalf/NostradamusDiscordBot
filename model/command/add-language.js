const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');
const Language = require('../language');

/**
 * @param {Message} message
 * @param {Array} args
 */
module.exports = {
    aliases: ['addlanguage'],
    process: async (message, args) => {
        const member = await Guild.getMemberFromMessage(message);

        if (Guild.isMemberMod(member)) {
            args = args.join(' ').split('|');

            const friendly = args[0];
            const role = args[1];

            if (!message.guild.roles.find(guildRole => guildRole.name === role)) {
                Guild.createRole(role)
                    .then(roleInstance => {
                        message.reply(trans('model.command.addLanguage.discordRoleAddSuccess', [roleInstance], 'en'));

                        // then add to database
                        Language.add(friendly, role).then(() => {
                            message.reply(trans('model.command.addLanguage.databaseRoleAddSuccess', [role], 'en'));
                        }).catch(error => {
                            Logger.exception(error);
                            message.reply(trans('model.command.addLanguage.databaseRoleAddError', [role], 'en'));
                        });
                    }).catch(error => {
                        Logger.exception(error);
                        message.reply(trans('model.command.addLanguage.discordRoleAddError', [role], 'en'));
                    });
            } else {
                message.channel.send(trans('model.command.addLanguage.alreadyExists', [role], 'en'));
            }
        }
    }
};
