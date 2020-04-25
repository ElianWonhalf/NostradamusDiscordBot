const Discord = require('discord.js');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['getunassignedroles', 'get-unassigned-role', 'getunassignedrole', 'gur'],
    category: CommandCategory.ADMINISTRATION,
    isAllowedForContext: CommandPermission.isMommy,
    process: async (message) => {
        const waitMessage = await message.reply(trans('model.command.getUnassignedRoles.wait', [], 'en'));

        const unassignedRoles = Guild.discordGuild.roles.cache.filter(role => {
            return Guild.discordGuild.members.cache.filter(member => member.roles.cache.has(role.id)).size < 1;
        }).map(role => role.name).join('\n');

        const answers = Discord.Util.splitMessage(unassignedRoles);
        await waitMessage.delete();

        for (let i = 0; i < answers.length; i++) {
            await message.channel.send(answers[i]);
        }
    }
};
