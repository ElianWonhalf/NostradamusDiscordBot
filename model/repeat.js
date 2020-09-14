const { Collection } = require('discord.js');

const lastMessage = new Collection();

class Repeat {
    /**
     * @param {Message} message
     */
    async messageHandler(message) {
        if (message.guild === null || message.cleanContent.length < 1 || message.author.id === bot.user.id) {
            return;
        }

        if (lastMessage.has(message.channel.id)) {
            const { lastString, snowflakes, answered } = lastMessage.get(message.channel.id);
            const shouldRepeat = message.mentions.guild.size < 1
                && message.mentions.roles.size < 1
                && !message.mentions.everyone
                && message.mentions.users.size < 1
                && !/^[\W_]/u.test(message.cleanContent)
                && !/http/gu.test(message.cleanContent);

            if (message.cleanContent === lastString && !answered && !snowflakes.includes(message.author.id)) {
                snowflakes.push(message.author.id);
            } else if (message.cleanContent !== lastString) {
                lastMessage.set(
                    message.channel.id,
                    { lastString: message.cleanContent, snowflakes: [message.author.id], answered: false }
                );
            }

            if (snowflakes.length > 2 && !answered && shouldRepeat) {
                message.channel.send(message.cleanContent);
                lastMessage.set(
                    message.channel.id,
                    { lastString: message.cleanContent, snowflakes, answered: true }
                );
            } else if (message.cleanContent === lastString && answered) {
                message.delete();
            }
        } else {
            lastMessage.set(
                message.channel.id,
                { lastString: message.cleanContent, snowflakes: [message.author.id], answered: false }
            );
        }
    }
}

module.exports = new Repeat();