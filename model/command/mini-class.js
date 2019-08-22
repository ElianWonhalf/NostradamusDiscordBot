const Config = require('../../config.json');
const Guild = require('../guild');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['miniclass', 'miniclasse', 'mini-classe'],
    process: async (message) => {
        const member = Guild.getMemberFromMessage(message);

        if (member.roles.has(Config.roles.miniClass)) {
            member.removeRole(Config.roles.miniClass).then(() => {
                message.reply(`\n${trans('model.command.miniClass.alertsOff')}`);
            });
        } else {
            member.addRole(Config.roles.miniClass).then(() => {
                message.reply(`\n${trans('model.command.miniClass.alertsOn')}`);
            });
        }
    }
};
