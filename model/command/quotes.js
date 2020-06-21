const Heat = require('../heat');
const Config = require('../../config.json');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class Quotes extends Heat
{
    static instance = null;

    constructor() {
        if (Quotes.instance !== null) {
            return Quotes.instance;
        }

        super(10 * SECOND);
        this.aliases = ['guillemets'];
        this.category = CommandCategory.RESOURCE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        if (this.canCall()) {
            this.registerCall();
            message.channel.send(trans('model.command.quotes.answer', [], Config.learntLanguagePrefix));
        } else {
            message.react('⌛');
        }
    }
}

module.exports = new Quotes();
