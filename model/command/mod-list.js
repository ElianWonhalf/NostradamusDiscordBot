const Config = require('../../config.json');

/**
 * @param {Message} message
 */
module.exports = async (message) => {
    let list = message.guild.members.filter(
        member => member.roles.has(Config.roles.mod)
    ).map(
        member => (member.nickname !== null ? member.nickname : member.user.username) + '#' + member.user.discriminator
    );

    message.reply(`\n${trans('model.command.modList.answer', [list.length])}${list.join('\n')}`);
};
