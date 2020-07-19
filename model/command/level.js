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

        if (!Guild.levelRoles.array().some(roleName => argsStr.includes(roleName.toLowerCase()))) {
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

        const targetRoleId = Guild.levelRoles.findKey(roleName => argsStr.includes(roleName.toLowerCase()));
        const targetRole = Guild.discordGuild.roles.cache.get(targetRoleId);

        foundMembers.forEach(async member => {
            const levelRoles = member.roles.cache.keyArray().filter(
                value => Guild.levelRoles.keyArray().includes(value)
            );

            await member.roles.remove(levelRoles);
            await member.roles.add(targetRoleId);

            Guild.botChannel.send(trans('model.command.level.logAction', [author.toString(), member.id, targetRole.name], 'en'));
        });

        message.reply(trans('model.command.level.setRole', [targetRole.name]));
    }
}

module.exports = new Level();
