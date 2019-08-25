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
        if (message.guild === null || message.channel.id !== Config.channels.welcome) {
            return;
        }

        const member = await Guild.getMemberFromMessage(message);
        const country = args.join(' ').toLowerCase().trim();

        if (country !== '') {
            const rolesToRemove = member.roles.array().filter(role => {
                return Country.getRoleNameList().indexOf(role.name) > -1 || role.id === Config.roles.noCountry
            });
            const roleName = Country.getRoleNameFromString(country);

            let role = null;

            if (roleName !== null) {
                role = Guild.getRoleByName(roleName);
            }

            if (role === null) {
                Guild.botChannel.send(trans('model.command.country.request', [member, country], 'en'), Guild.messageToEmbed(message));
            }

            if (rolesToRemove.length > 0) {
                await member.removeRoles(rolesToRemove);
            }

            if (role !== null && !rolesToRemove.has(role.id)) {
                member.addRole(role).then(member => {
                    MemberRolesFlow.answerWithNextStep(message, member);
                });
            }
        } else {
            message.reply(trans('model.command.country.missingArgument', [Config.prefix, Config.prefix]));
        }
    }
};