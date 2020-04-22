const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['getunassignedroles', 'get-unassigned-role', 'getunassignedrole', 'gur'],
    category: CommandCategory.BOT_MANAGEMENT,
    isAllowedForContext: CommandPermission.isMemberMod,
    process: async (message) => {
        const unassignedRoles = Guild.discordGuild.roles.cache.filter(role => {
            return Guild.discordGuild.members.cache.filter(member => member.roles.cache.has(role.id)).size > 0;
        }).map(role => role.name).join('\n');

        message.channel.send(unassignedRoles);
    }
};
