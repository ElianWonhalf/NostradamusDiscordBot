const Logger = require('@lilywonhalf/pretty-logger');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class Edit
{
    static instance = null;

    constructor() {
        if (Edit.instance !== null) {
            return Edit.instance;
        }

        this.aliases = ['editer', 'modifier', 'modify'];
        this.category = CommandCategory.BOT_MANAGEMENT;
        this.isAllowedForContext = CommandPermission.isMemberMod;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        let channel = message.channel;

        if (message.mentions.channels.size > 0) {
            channel = message.mentions.channels.first();
            args.shift();
        }

        const target = await channel.messages.fetch(args.shift());

        target.edit(args.join(' ')).then(async () => {
            await message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollyes'));
        }).catch(async (error) => {
            Logger.error(error.toString());
            await message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollno'));
        });
    }
}

module.exports = new Edit();
