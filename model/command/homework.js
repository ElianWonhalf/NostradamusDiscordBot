const Heat = require('../heat');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class Homework extends Heat
{
    static instance = null;

    constructor() {
        if (Homework.instance !== null) {
            return Homework.instance;
        }

        super(10 * SECOND);
        this.aliases = ['homeworkhelp', 'devoirs'];
        this.category = CommandCategory.RESOURCE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        if (this.canCall()) {
            this.registerCall();
            message.channel.send(trans('model.command.homework.reply'));
        } else {
            message.react('⌛');
        }
    }
}

module.exports = new Homework();
