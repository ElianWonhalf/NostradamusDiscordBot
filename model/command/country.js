const Config = require('../../config.json');
const Guild = require('../guild');
const Country = require('../country');
const MemberRolesFlow = require('../member-roles-flow');

/**
 * @param {Message} message
 * @param {Array} args
 */
module.exports = {
    aliases: ['pays'],
    process: async (message, args) => {
        if (message.guild === null || message.channel.id !== Config.channels.roles) {
            return;
        }

        const member = await Guild.getMemberFromMessage(message);
        const country = args.join(' ').toLowerCase().trim();

        if (country !== '') {
            const rolesToRemove = member.roles.filter(role => {
                return Country.getRoleNameList().indexOf(role.name) > -1;
            });
            const roleName = Country.getRoleNameFromString(country);

            let role = null;

            if (roleName !== null) {
                role = Guild.getRoleByName(roleName);
            }

            if (rolesToRemove.size > 0) {
                await member.removeRoles(rolesToRemove.array());
            }

            if (role !== null) {
                if (!rolesToRemove.has(role.id)) {
                    member.addRole(role);
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