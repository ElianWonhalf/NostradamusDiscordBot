const Logger = require('@lilywonhalf/pretty-logger');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

const emojiNameRegex = /^<?[^:]*:(?<name>[^:]+):[^>]*>?$/u;
const stringEmojiMap = {
    vote: ['pollyes', 'pollno', 'pollneutral'],
    votes: ['pollyes', 'pollno', 'pollneutral']
};

/**
 * @param {Message} message
 */
module.exports = {
    aliases: [],
    category: CommandCategory.RESOURCE,
    isAllowedForContext: CommandPermission.isMemberMod,
    process: async (message, args) => {
        let targetedMessage;

        if (args[0].match(/^\d+$/u) !== null) {
            targetedMessage = await message.channel.messages.fetch(args.shift());
        } else {
            const fetchMessageOptions = { limit: 1, before: message.channel.lastMessageID };
            targetedMessage = (await message.channel.messages.fetch(fetchMessageOptions)).first();
        }

        const emojis = [];

        args.forEach(arg => {
            let foundEmoji = arg.replace(/[\s\n]+/u, '');

            if (foundEmoji.match(emojiNameRegex) !== null) {
                const name = arg.replace(emojiNameRegex, '$<name>');
                foundEmoji = bot.emojis.cache.find(emoji => emoji.name === name);

                if (typeof foundEmoji === 'undefined') {
                    message.reply(trans('model.command.react.notFound', [name], 'en'));
                }
            } else if (typeof stringEmojiMap[foundEmoji] !== 'undefined') {
                Array.prototype.push.apply(
                    emojis,
                    stringEmojiMap[foundEmoji].map(
                        name => bot.emojis.cache.find(emoji => emoji.name === name)
                    )
                );

                // Yes, that's just a non-risky way to get an undefined "value"
                foundEmoji = (() => {})();
            }

            if (typeof foundEmoji !== 'undefined') {
                emojis.push(foundEmoji);
            }
        });

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
