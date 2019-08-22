const Config = require('../../config.json');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['tuteur', 'tuteurs', 'tutor'],
    process: async (message) => {
        let list = message.guild.members.filter(
            member => member.roles.has(Config.roles.tutor)
        ).map(
            member => (member.nickname !== null ? member.nickname : member.user.username) + '#' + member.user.discriminator
        );

        message.reply(`\n${trans('model.command.tutors.answer', [list.length])}${list.join('\n')}`);
    }
};
