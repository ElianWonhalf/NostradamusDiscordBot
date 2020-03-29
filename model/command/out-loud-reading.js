const Config = require('../../config.json');
const Guild = require('../guild');
const CommandCategory = require('../command-category');

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
    category: CommandCategory.ROLE,

    process: async (message) => {
        const member = await Guild.getMemberFromMessage(message);

        if (member.roles.cache.has(Config.roles.outLoudReading)) {
            member.roles.remove(Config.roles.outLoudReading).then(() => {
                message.reply(trans('model.command.outLoudReading.alertsOff'));
            });
        } else {
            member.roles.add(Config.roles.outLoudReading).then(() => {
                message.reply(trans('model.command.outLoudReading.alertsOn'));
            });
        }
    }
};
