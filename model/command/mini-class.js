const Config = require('../../config.json');
const Guild = require('../guild');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['miniclass', 'miniclasse', 'mini-classe', 'minicours', 'mini-cours'],
    process: async (message) => {
        const member = await Guild.getMemberFromMessage(message);

        if (member.roles.has(Config.roles.miniClass)) {
            member.removeRole(Config.roles.miniClass).then(() => {
                message.reply(trans('model.command.miniClass.alertsOff'));
            });
        } else {
            member.addRole(Config.roles.miniClass).then(() => {
                message.reply(trans('model.command.miniClass.alertsOn'));
            });
        }
    }
};
