const Config = require('../../config.json');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['modlist', 'mod', 'modo', 'mods', 'modos', 'modérateur', 'modérateurs', 'moderateur', 'moderateurs', 'moderator', 'moderators'],
    process: async (message) => {
        let list = message.guild.members.filter(
            member => member.roles.has(Config.roles.mod)
        ).map(
            member => (member.nickname !== null ? member.nickname : member.user.username) + '#' + member.user.discriminator
        );

        message.reply(`${trans('model.command.modList.answer', [list.length])}\n\n${list.join('\n')}`);
    }
};
