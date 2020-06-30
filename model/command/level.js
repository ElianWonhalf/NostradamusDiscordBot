const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class Level
{
    static instance = null;

    constructor() {
        if (Level.instance !== null) {
            return Level.instance;
        }

        this.aliases = ['niveau'];
        this.category = CommandCategory.ROLE;
        this.isAllowedForContext = CommandPermission.isMemberModOrTutor;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        const argsStr = args.join(' ').toLowerCase().trim();

        if (message.members === null || message.members.length === 0) {
            message.reply(
                trans('model.command.level.noMembersGiven')
            );
            return;
        }

        for (let i = 0; i < Guild.levelRoles.length; i++) {
            if (argsStr.includes(Guild.levelRoles[i].toLowerCase())) {
                break;
            }
            message.reply(
                trans('model.command.level.roleNotFound')
            );
            return;
        }
        const targetRoleName = Guild.levelRoles[i];
        const targetRole = Guild.getRoleByName(targetRoleName);

        const levelRoles = Guild.levelRoles.map(name => Guild.getRoleByName(name));
        message.members.each(member => {
            await Promise.all([
                member.roles.remove(levelRoles),
                member.roles.add(targetRole),
            ]);
        });
        message.reply(
            trans('model.command.level.setRole', [targetRoleName])
        );
    }
}

module.exports = new Level();
