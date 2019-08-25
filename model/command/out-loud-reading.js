const Config = require('../../config.json');
const Guild = require('../guild');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: [
        'outloudreading',
        'aloudreading',
        'reading',
        'readingoutloud',
        'readingaloud',
        'lecture-à-voix-haute',
        'lecture-a-voix-haute',
        'lectureàvoixhaute',
        'lectureavoixhaute',
        'lecture',
        'lecturevoixhaute',
        'lecture-voix-haute'
    ],

    process: async (message) => {
        const member = await Guild.getMemberFromMessage(message);

        if (member.roles.has(Config.roles.outLoudReading)) {
            member.removeRole(Config.roles.outLoudReading).then(() => {
                message.reply(trans('model.command.outLoudReading.alertsOff'));
            });
        } else {
            member.addRole(Config.roles.outLoudReading).then(() => {
                message.reply(trans('model.command.outLoudReading.alertsOn'));
            });
        }
    }
};
