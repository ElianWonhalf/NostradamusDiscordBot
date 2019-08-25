const Config = require('../../config.json');
const Guild = require('../guild');
const Language = require('../language');
const MemberRolesFlow = require('../member-roles-flow');

/**
 * @param {Message} message
 * @param {Array} args
 */
module.exports = {
    aliases: ['langue', 'langage'],
    process: async (message, args) => {
        if (message.guild === null || message.channel.id !== Config.channels.welcome) {
            return;
        }

        const member = await Guild.getMemberFromMessage(message);
        const language = args.join(' ').toLowerCase().trim();

        if (language !== '') {
            const roleName = Language.getRoleNameFromString(language);
            let role = null;

            if (roleName !== null) {
                role = Guild.getRoleByName(roleName);
            }

            let rolesToRemove = member.roles.array().filter(role => {
                return Language.getRoleNameList().indexOf(role.name) > -1 || role.id === Config.roles.noLanguage;
            });

            if (role === null) {
                Guild.botChannel.send(trans('model.command.language.request', [member, language], 'en'), Guild.messageToEmbed(message));
                role = Config.roles.noLanguage;
                rolesToRemove = rolesToRemove.filter(role => role.id !== Config.roles.noLanguage);
            } else if (role.id === Config.roles.native) {
                rolesToRemove = rolesToRemove.concat(member.roles.array().filter(
                    role => Object.values(Guild.levelRoles).indexOf(role.name) > -1
                ));
            }

            if (rolesToRemove.length > 0) {
                await member.removeRoles(rolesToRemove);
            }

            member.addRole(role).then(member => {
                MemberRolesFlow.answerWithNextStep(message, member);
            });
        } else {
            message.reply(trans('model.command.language.missingArgument', [Config.prefix, Config.prefix]));
        }
    }
};
