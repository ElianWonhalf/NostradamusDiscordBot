const Logger = require('@lilywonhalf/pretty-logger');
const Guild = require('../guild');
const Country = require('../country');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class AddCountry
{
    static instance = null;

    constructor() {
        if (AddCountry.instance !== null) {
            return AddCountry.instance;
        }

        this.aliases = ['addcountry'];
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

module.exports = new AddCountry();
