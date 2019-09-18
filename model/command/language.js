const Logger = require('@elian-wonhalf/pretty-logger');
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
        if (message.guild === null || message.channel.id !== Config.channels.roles) {
            return;
        }

        const member = await Guild.getMemberFromMessage(message);
        const language = args.join(' ').toLowerCase().trim();

        if (language !== '') {
            if (Guild.isMemberNative(member)) {
                message.reply(
                    trans('model.command.language.callMods', [`%${Config.learntLanguage}%`])
                );

                return;
            }

            let rolesToRemove = member.roles.filter(role => {
                return Language.getRoleNameList().indexOf(role.name) > -1;
            });
            const roleName = Language.getRoleNameFromString(language);

            let role = null;

            if (roleName !== null) {
                role = Guild.getRoleByName(roleName);
            }

            if (role !== null && role.id === Config.roles.native) {
                message.reply(
                    trans('model.command.language.illegal', [`%${Config.learntLanguage}%`])
                );

                return;
            }

            if (rolesToRemove.size > 0) {
                await member.removeRoles(rolesToRemove);
            }

            if (role !== null) {
                if (!rolesToRemove.has(role.id)) {
                    member.addRole(role);
                    message.reply(trans('model.command.language.added', [role.name]));
                } else {
                    message.reply(trans('model.command.language.removed', [role.name]));
                }
            } else {
                message.reply(
                    trans('model.command.language.missingRole')
                );
                Guild.botChannel.send(
                    trans('model.command.language.request', [member, language], 'en'),
                    await Guild.messageToEmbed(message)
                );
            }
        } else {
            message.reply(
                trans('model.command.language.missingArgument', [Config.prefix, Config.prefix])
            );
        }
    }
};
