const Heat = require('../heat');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class Trombinoscope extends Heat
{
    static instance = null;

    constructor() {
        if (Trombinoscope.instance !== null) {
            return Trombinoscope.instance;
        }

        super(10 * SECOND);
        this.aliases = ['trombi', 'tromb'];
        this.category = CommandCategory.RESOURCE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        if (this.canCall()) {
            this.registerCall();
            message.channel.send(trans('model.command.trombinoscope.reply'));
        } else {
            message.react('⌛');
        }
    }
}

module.exports = new Trombinoscope();
