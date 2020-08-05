const Heat = require('../heat');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class Dictionaries extends Heat
{
    static instance = null;

    constructor() {
        if (Dictionaries.instance !== null) {
            return Dictionaries.instance;
        }

        super(10 * SECOND);
        this.aliases = ['dictionnaires','dico','traducteurs','translators'];
        this.category = CommandCategory.RESOURCE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        if (this.canCall()) {
            this.registerCall();
            message.channel.send(
                trans(
                    'model.command.dictionaries.reply',
                    [
                        ['model.command.dictionaries.reply.wordreference'],
                        ['model.command.dictionaries.reply.usito'],
                        ['model.command.dictionaries.reply.deepl'],
                        ['model.command.dictionaries.reply.googleTranslate'],
                        ['model.command.dictionaries.reply.reversoContextAndLinguee'],
                    ]
                )
            );
        } else {
            message.react('⌛');
        }
    }
}

module.exports = new Dictionaries();
