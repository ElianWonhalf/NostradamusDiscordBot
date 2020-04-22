const Config = require('../../config.json');
const Guild = require('../guild');
const Country = require('../country');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

/**
 * @param {Message} message
 * @param {Array} args
 */
module.exports = {
    aliases: ['pays'],
    category: CommandCategory.ROLE,
    isAllowedForContext: CommandPermission.inRoles,
    process: async (message, args) => {
        const member = await Guild.getMemberFromMessage(message);
        const country = args.join(' ').toLowerCase().trim();

        if (country !== '') {
            const rolesToRemove = member.roles.cache.filter(role => {
                return Country.getRoleNameList().indexOf(role.name) > -1;
            });
            const roleName = Country.getRoleNameFromString(country);

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
};