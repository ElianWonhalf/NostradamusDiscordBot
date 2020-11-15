const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');
const EmojiCharacters = require('../../emoji-characters.json');

class Ping
{
    static instance = null;

    constructor() {
        if (Ping.instance !== null) {
            return Ping.instance;
        }

        this.aliases = [];
        this.category = CommandCategory.INFO;
        this.isAllowedForContext = CommandPermission.yes;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        const reactions = [
            bot.emojis.cache.find(emoji => emoji.name === 'eowynsheep'),
            EmojiCharacters.p,
            EmojiCharacters.o,
            EmojiCharacters.n,
            EmojiCharacters.g,
            '✨',
        ];

        for (let reaction of reactions) {
            await message.react(reaction);
        }
    }
}

module.exports = new Ping();
