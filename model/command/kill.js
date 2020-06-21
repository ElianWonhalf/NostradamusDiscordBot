const Logger = require('@lilywonhalf/pretty-logger');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class Kill
{
    static instance = null;

    constructor() {
        if (Kill.instance !== null) {
            return Kill.instance;
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

        await message.react(emoji);
        Logger.notice('killnostrapls');
    }
}

module.exports = new Kill();
