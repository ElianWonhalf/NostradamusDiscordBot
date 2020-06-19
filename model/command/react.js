const Logger = require('@lilywonhalf/pretty-logger');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

const emojiNameRegex = /^<?[^:]*:(?<name>[^:]+):[^>]*>?$/u;

/**
 * @param {Message} message
 */
module.exports = {
    aliases: [],
    category: CommandCategory.RESOURCE,
    isAllowedForContext: CommandPermission.isMemberMod,
    process: async (message, args) => {
        const messageId = args.shift();
        const targetedMessage = await message.channel.messages.fetch(messageId);

        const emojis = args.map(arg => {
            let foundEmoji = arg.replace(/[\s\n]+/u, '');

            if (foundEmoji.match(emojiNameRegex) !== null) {
                const name = arg.replace(emojiNameRegex, '$<name>');
                foundEmoji = bot.emojis.cache.find(emoji => emoji.name === name);

                if (typeof foundEmoji === 'undefined') {
                    message.reply(trans('model.command.react.notFound', [name], 'en'));
                }
            }

            return foundEmoji;
        }).filter(emoji => typeof emoji !== 'undefined');

        while (emojis.length > 0) {
            const emoji = emojis.shift();

            await targetedMessage.react(emoji).catch(error => {
                Logger.error(error);
                message.reply(trans('model.command.react.error', [emoji.name, error.trace], 'en'));
            });
        }

        await message.delete();
    }
};
