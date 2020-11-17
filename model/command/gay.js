const Heat = require('../heat');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class Gay extends Heat
{
    static instance = null;

    constructor() {
        if (Gay.instance !== null) {
            return Gay.instance;
        }

        super(30 * SECOND);
        this.aliases = [];
        this.category = CommandCategory.RESOURCE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        if (this.canCall()) {
            this.registerCall();

            message.channel.send(trans('model.command.gay.reply'));
        } else {
            message.react('⌛');
        }
    }
}

module.exports = new Gay();
