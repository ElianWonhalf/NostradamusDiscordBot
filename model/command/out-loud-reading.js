const Config = require('../../config.json');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class OutLoudReading
{
    static instance = null;

    constructor() {
        if (OutLoudReading.instance !== null) {
            return OutLoudReading.instance;
        }

        this.aliases = [
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
        ];

        this.category = CommandCategory.ROLE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
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
}

module.exports = new OutLoudReading();
