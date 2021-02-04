const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

const emojiClue = '🔎';
const emojiKayak = '🛶';
const arrayEmojis = [];
arrayEmojis.push(bot.emojis.cache.find(emoji => emoji.name === 'foxlong1'));
arrayEmojis.push(bot.emojis.cache.find(emoji => emoji.name === 'foxlong2'));
arrayEmojis.push(bot.emojis.cache.find(emoji => emoji.name === 'foxlong3'));
arrayEmojis.push('🍀');

/**
 * 
 * @param {Message} botMessage 
 * @param {Message} message 
 */
const addReact = (botMessage, message) => {
    message.react(emojiClue);

    const reactFilter = (reaction, user) => user.id === message.author.id && reaction.emoji.name === emojiClue;

    message.awaitReactions(reactFilter, { max: 1, maxEmojis: 1, time: 15000 }).then(collectedReactions => {
        if (!collectedReactions.first()) {
            message.reactions.removeAll();
        } else {
            message.reactions.removeAll().then(() => {
                arrayEmojis.map(emoji => botMessage.react(emoji));
                message.react(emojiKayak);
            });

            botMessage.edit(`? pleh uoy naC ...nwod edispu s'eh ,ykculnu si xof sihT`);
        }
    });
};

class XofYkcul
{
    static instance = null;

    constructor() {
        if (XofYkcul.instance !== null) {
            return XofYkcul.instance;
        }

        this.aliases = [];
        this.category = CommandCategory.RESOURCE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        message.channel.send('...aedi on evah i ,yrroS').then(botMessage => addReact(botMessage, message));
    }
}

module.exports = new XofYkcul();
