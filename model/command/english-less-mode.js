const Config = require('../../config.json');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class EnglishLessMode
{
    static instance = null;

    constructor() {
        if (EnglishLessMode.instance !== null) {
            return EnglishLessMode.instance;
        }

        this.aliases = ['english-less', 'en-less'];
        this.category = CommandCategory.ROLE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        const member = await Guild.getMemberFromMessage(message);

        if (member.roles.cache.has(Config.roles.englishLessMode)) {
            member.roles.remove(Config.roles.englishLessMode).then(() => {
                message.reply(trans('model.command.englishLessMode.disabled', [Guild.otherLanguageChannel]));
            });
        } else {
            member.roles.add(Config.roles.englishLessMode).then(() => {
                message.reply(trans('model.command.englishLessMode.enabled', [Guild.otherLanguageChannel]));
            });
        }
    }
}

module.exports = new EnglishLessMode();
