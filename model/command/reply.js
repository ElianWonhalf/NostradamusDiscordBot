const Heat = require('../heat');
const Logger = require('@lilywonhalf/pretty-logger');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class Reply extends Heat
{
    static instance = null;

    constructor() {
        if (Reply.instance !== null) {
            return Reply.instance;
        }

        super(10 * SECOND);
        this.aliases = [];
        this.category = CommandCategory.FUN;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        if (this.canCall()) {
            this.registerCall();

            message.delete().catch(Logger.exception);
            message.channel.send(
                trans(
                    `model.command.reply.${Math.random() < 0.92 ? 'calisse' : 'tabarnak'}`,
                    [],
                    'fr'
                )
            );
        } else {
            message.react('⌛');
        }
    }
}

module.exports = new Reply();
