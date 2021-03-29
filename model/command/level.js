const Config = require('../../config.json');
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
        this.isAllowedForContext = CommandPermission.or(CommandPermission.isMemberModOrSoft, CommandPermission.isMemberSubredditMod);
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        const authorMember = await Guild.getMemberFromMessage(message);
        const argsStr = args.join(' ').toLowerCase().trim();

        if (!Guild.levelRoles.array().some(roleName => argsStr.includes(roleName.toLowerCase()))) {
            await message.reply(trans('model.command.level.roleNotFound'));
            return;
        }

        const { certain, foundMembers } = Guild.findDesignatedMemberInMessage(message);

        if (!certain) {
            await message.reply(trans('model.command.level.invalidMemberMentions'));
            return;
        }

        if (foundMembers.length < 1) {
            await message.reply(trans('model.command.level.noMembersGiven'));
            return;
        }

        const targetRoleId = Guild.levelRoles.findKey(roleName => argsStr.includes(roleName.toLowerCase()));
        const targetRole = Guild.discordGuild.roles.cache.get(targetRoleId);

        await Promise.all(foundMembers.map(async member => {
            const levelRoles = member.roles.cache.keyArray().filter(
                value => Guild.levelRoles.keyArray().includes(value)
            );

            await member.roles.remove(levelRoles);
            await member.roles.add(targetRoleId);

            if (!member.roles.cache.has(Config.roles.officialMember)) {
                await member.roles.add(Config.roles.officialMember);
            }

            Guild.memberModificationLogChannel.send(trans('model.command.level.logAction', [authorMember.user.username, member.id, targetRole.name], 'en'));
        }));

        await message.reply(trans('model.command.level.setRole', [targetRole.name]));
    }
}

module.exports = new Level();
