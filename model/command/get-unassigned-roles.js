const Discord = require('discord.js');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class GetUnassignedRoles
{
    static instance = null;

    constructor() {
        if (GetUnassignedRoles.instance !== null) {
            return GetUnassignedRoles.instance;
        }

        this.aliases = ['getunassignedroles', 'get-unassigned-role', 'getunassignedrole', 'gur'];
        this.category = CommandCategory.ADMINISTRATION;
        this.isAllowedForContext = CommandPermission.isMommy;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        const waitMessage = await message.reply(trans('model.command.getUnassignedRoles.wait', [], 'en'));

        const unassignedRoles = Guild.discordGuild.roles.cache.filter(role => {
            return Guild.discordGuild.members.cache.filter(member => member.roles.cache.has(role.id)).size < 1;
        }).map(role => role.name).join('\n');

        const answers = Discord.Util.splitMessage(unassignedRoles);
        await waitMessage.delete();

        for (let i = 0; i < answers.length; i++) {
            await message.channel.send(answers[i]);
        }
    }
}

module.exports = new GetUnassignedRoles();
