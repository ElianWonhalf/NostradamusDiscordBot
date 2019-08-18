const Config = require('../../config.json');
const Guild = require('../guild');

/**
 * @param {Message} message
 */
module.exports = async (message) => {
    const member = Guild.getMemberFromMessage(message);

    if (member.roles.has(Config.roles.dictation)) {
        member.removeRole(Config.roles.dictation).then(() => {
            message.reply(`\n${trans('model.command.dictation.alertsOff')}`);
        });
    } else {
        member.addRole(Config.roles.dictation).then(() => {
            message.reply(`\n${trans('model.command.dictation.alertsOn')}`);
        });
    }
};
