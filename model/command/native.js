const Heat = require('../heat');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class Native extends Heat
{
    static instance = null;

    constructor() {
        if (Native.instance !== null) {
            return Native.instance;
        }

        super(10 * SECOND);
        this.aliases = ['natif'];
        this.category = CommandCategory.RESOURCE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        if (this.canCall()) {
            this.registerCall();
            message.channel.send(trans('model.command.native.reply'));
        } else {
            message.react('⌛');
        }
    }
}

module.exports = new Native();
