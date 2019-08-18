const Config = require('../../config.json');
const Guild = require('../guild');

/**
 * @param {Message} message
 */
module.exports = async (message) => {
    const member = Guild.getMemberFromMessage(message);

    if (member.roles.has(Config.roles.outLoudReading)) {
        member.removeRole(Config.roles.outLoudReading).then(() => {
            message.reply(`\n${trans('model.command.outLoudReading.alertsOff')}`);
        });
    } else {
        member.addRole(Config.roles.outLoudReading).then(() => {
            message.reply(`\n${trans('model.command.outLoudReading.alertsOn')}`);
        });
    }
};
