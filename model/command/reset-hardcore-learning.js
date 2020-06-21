const HardcoreLearning = require('../hardcore-learning');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class ResetHardcoreLearning
{
    static instance = null;

    constructor() {
        if (ResetHardcoreLearning.instance !== null) {
            return ResetHardcoreLearning.instance;
        }

        this.aliases = [];
        this.category = CommandCategory.BOT_MANAGEMENT;
        this.isAllowedForContext = CommandPermission.isMemberMod;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        const emoji = bot.emojis.cache.find(emoji => emoji.name === 'eowynsheep');

        HardcoreLearning.reset();
        message.react(emoji);
    }
}

module.exports = new ResetHardcoreLearning();
