const Heat = require('../heat');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class Glottophobia extends Heat
{
    static instance = null;

    constructor() {
        if (Glottophobia.instance !== null) {
            return Glottophobia.instance;
        }

        super(10 * SECOND);
        this.aliases = ['glottophobie'];
        this.category = CommandCategory.RESOURCE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        if (this.canCall()) {
            this.registerCall();
            message.channel.send(trans('model.command.glottophobia.reply'));
        } else {
            message.react('⌛');
        }
    }
}

module.exports = new Glottophobia();