const Heat = require('../heat');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class LanguageHard extends Heat
{
    static instance = null;

    constructor() {
        if (LanguageHard.instance !== null) {
            return LanguageHard.instance;
        }

        super(10 * SECOND);
        this.aliases = ['languedifficile', 'hardlanguage', 'languagehard', 'languehard', 'langue-hard'];
        this.category = CommandCategory.RESOURCE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        if (this.canCall()) {
            this.registerCall();
            message.channel.send(trans('model.command.languageHard.reply'));
        } else {
            message.react('⌛');
        }
    }
}

module.exports = new LanguageHard();
