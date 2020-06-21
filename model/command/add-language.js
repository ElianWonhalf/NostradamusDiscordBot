const Logger = require('@lilywonhalf/pretty-logger');
const Guild = require('../guild');
const Language = require('../language');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class AddLanguage
{
    static instance = null;

    constructor() {
        if (AddLanguage.instance !== null) {
            return AddLanguage.instance;
        }

        this.aliases = ['addlanguage'];
        this.category = CommandCategory.ADMINISTRATION;
        this.isAllowedForContext = CommandPermission.isMemberMod;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        args = args.join(' ').split('|');

        const friendly = args[0];
        const role = args[1];

        if (!message.guild.roles.cache.find(guildRole => guildRole.name === role)) {
            Guild.createRole(role)
                .then(roleInstance => {
                    message.reply(trans('model.command.addLanguage.discordRoleAddSuccess', [roleInstance], 'en'));

                    // Then add to database
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

module.exports = new AddLanguage();
