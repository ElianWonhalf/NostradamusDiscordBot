const Config = require('../../config.json');
const Guild = require('../guild');
const LanguageEntity = require('../language');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class Language
{
    static instance = null;

    constructor() {
        if (Language.instance !== null) {
            return Language.instance;
        }

        this.aliases = ['langue', 'langage'];
        this.category = CommandCategory.ROLE;
        this.isAllowedForContext = CommandPermission.inRoles;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        const member = await Guild.getMemberFromMessage(message);
        const language = args.join(' ').toLowerCase().trim();

        if (language !== '') {
            if (Guild.isMemberNative(member)) {
                message.reply(
                    trans('model.command.language.callMods', [[Config.learntLanguage]])
                );

                return;
            }

            let rolesToRemove = member.roles.cache.filter(role => {
                return LanguageEntity.getRoleNameList().indexOf(role.name) > -1;
            });
            const roleName = LanguageEntity.getRoleNameFromString(language);

            let role = null;

            if (roleName !== null) {
                role = Guild.getRoleByName(roleName);
            }

            if (role !== null && role.id === Config.roles.native) {
                message.reply(
                    trans('model.command.language.illegal', [[Config.learntLanguage]])
                );

                return;
            }

            if (role !== null) {
                if (rolesToRemove.size > 0) {
                    await member.roles.remove(rolesToRemove);
                }

                if (!rolesToRemove.has(role.id)) {
                    member.roles.add(role);
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
}

module.exports = new Language();
