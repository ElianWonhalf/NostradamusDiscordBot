const Config = require('../../config.json');
const Guild = require('../guild');
const CountryEntity = require('../country');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class Country
{
    static instance = null;

    constructor() {
        if (Country.instance !== null) {
            return Country.instance;
        }

        this.aliases = ['pays'];
        this.category = CommandCategory.ROLE;
        this.isAllowedForContext = CommandPermission.inRoles;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        const member = await Guild.getMemberFromMessage(message);
        const country = args.join(' ').toLowerCase().trim();

        if (country !== '') {
            const rolesToRemove = member.roles.cache.filter(role => {
                return CountryEntity.getRoleNameList().indexOf(role.name) > -1;
            });
            const roleName = CountryEntity.getRoleNameFromString(country);

            let role = null;

            if (roleName !== null) {
                role = Guild.getRoleByName(roleName);
            }

            if (role !== null) {
                if (rolesToRemove.size > 0) {
                    await member.roles.remove(rolesToRemove.array());
                }

                if (!rolesToRemove.has(role.id)) {
                    member.roles.add(role);
                    message.reply(trans('model.command.country.added', [role.name]));
                } else {
                    message.reply(trans('model.command.country.removed', [role.name]));
                }
            } else {
                message.reply(trans('model.command.country.missingRole'));
                Guild.botChannel.send(
                    trans('model.command.country.request', [member, country], 'en'),
                    await Guild.messageToEmbed(message)
                );
            }
        } else {
            message.reply(
                trans('model.command.country.missingArgument', [Config.prefix, Config.prefix])
            );
        }
    }
}

module.exports = new Country();