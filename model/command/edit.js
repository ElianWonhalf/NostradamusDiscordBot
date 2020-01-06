const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');
const CommandCategory = require('../command-category');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['send'],
    category: CommandCategory.BOT_MANAGEMENT,
    process: async (message, content) => {
        const member = await Guild.getMemberFromMessage(message);

        if (Guild.isMemberMod(member)) {
            let channel = message.channel;

            if (message.mentions.channels.size > 0) {
                channel = message.mentions.channels.first();
                content.shift();
            }

            const target = await channel.fetchMessage(content.shift());

            target.edit(content.join(' ')).then(async () => {
                await message.react(bot.emojis.find(emoji => emoji.name === 'pollyes'));
            }).catch(async (error) => {
                Logger.error(error.toString());
                await message.react(bot.emojis.find(emoji => emoji.name === 'pollno'));
            });
        }
    }
};
