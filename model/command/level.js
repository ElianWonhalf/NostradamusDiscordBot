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
        const author = await Guild.getMemberFromMessage(message);
        const argsStr = args.join(' ').toLowerCase().trim();

        if (!Guild.levelRoles.some(roleName => argsStr.includes(roleName.toLowerCase()))) {
            message.reply(trans('model.command.level.roleNotFound'));
            return;
        }

        const { certain, foundMembers } = Guild.findDesignatedMemberInMessage(message);

        if (!certain) {
            message.reply(trans('model.command.level.invalidMemberMentions'));
            return;
        }

        if (foundMembers.length < 1) {
            message.reply(trans('model.command.level.noMembersGiven'));
            return;
        }

        const targetRoleName = Guild.levelRoles.find(roleName => argsStr.includes(roleName.toLowerCase()));
        const targetRole = Guild.getRoleByName(targetRoleName);
        const levelRoles = Guild.levelRoles.map(name => Guild.getRoleByName(name));

        foundMembers.each(member => {
            await Promise.all([
                member.roles.remove(levelRoles),
                member.roles.add(targetRole),
            ]);
            Guild.serverLogChannel.send(trans('model.command.level.logAction', [author.id, member.id, targetRole]));
        });

        message.reply(trans('model.command.level.setRole', [targetRoleName]));
    }
}

module.exports = new Level();
