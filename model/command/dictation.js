const Config = require('../../config.json');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class Dictation
{
    static instance = null;

    constructor() {
        if (Dictation.instance !== null) {
            return Dictation.instance;
        }

        this.aliases = ['dictee', 'dictée'];
        this.category = CommandCategory.ROLE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        const member = await Guild.getMemberFromMessage(message);

        if (member.roles.cache.has(Config.roles.dictation)) {
            member.roles.remove(Config.roles.dictation).then(() => {
                message.reply(trans('model.command.dictation.alertsOff'));
            });
        } else {
            member.roles.add(Config.roles.dictation).then(() => {
                message.reply(trans('model.command.dictation.alertsOn'));
            });
        }
    }
}

module.exports = new Dictation();
