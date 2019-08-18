const Config = require('../../config.json');
const Guild = require('../guild');

/**
 * @param {Message} message
 */
module.exports = async (message) => {
    const member = Guild.getMemberFromMessage(message);

    if (member.roles.has(Config.roles.games)) {
        member.removeRole(Config.roles.games).then(() => {
            message.reply(`\n${trans('model.command.games.alertsOff')}`);
        });
    } else {
        member.addRole(Config.roles.games).then(() => {
            message.reply(`\n${trans('model.command.games.alertsOn')}`);
        });
    }
};
