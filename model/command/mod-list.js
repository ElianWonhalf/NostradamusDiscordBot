const Config = require('../../config.json');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['modlist', 'mod', 'modo', 'mods', 'modos', 'modérateur', 'modérateurs', 'moderateur', 'moderateurs', 'moderator', 'moderators'],
    category: CommandCategory.INFO,
    isAllowedForContext: CommandPermission.notInWelcome,
    process: async (message) => {
        let list = message.guild.members.cache.filter(
            member => member.roles.cache.has(Config.roles.mod)
        ).map(
            member => member.displayName + '#' + member.user.discriminator
        );

        message.reply(`${trans('model.command.modList.answer', [list.length])}\n\n${list.join('\n')}`);
    }
};
