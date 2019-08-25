const Config = require('../../config.json');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['comitee', 'commitee', 'comittee', 'committe', 'comite', 'comité'],
    process: async (message) => {
        let list = message.guild.members.filter(
            member => member.roles.has(Config.roles.committee)
        ).map(
            member => (member.nickname !== null ? member.nickname : member.user.username) + '#' + member.user.discriminator
        );

        message.reply(`${trans('model.command.committee.answer', [list.length])}\n\n${list.join('\n')}`);
    }
};
