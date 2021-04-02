const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');
const MemberToken = require('../member-token');

const editMessage = async (message, content) => {
    return new Promise(async resolve => {
        await message.edit(content);
        setTimeout(resolve, SECOND);
    });
};

class TokenRain
{
    static instance = null;

    constructor() {
        if (TokenRain.instance !== null) {
            return TokenRain.instance;
        }

        this.aliases = ['tokenRain', 'train'];
        this.category = CommandCategory.FUN;
        this.isAllowedForContext = CommandPermission.isMemberModOrSoftOrAnimator;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        if (message.channel.type === 'dm') {
            return;
        }

        const emojiKwiziq = bot.emojis.cache.find(emoji => emoji.name === 'kwiziq');
        let amountRepeat = 5;
        const sentMessage = await message.channel.send(trans('model.command.tokenRain.incoming', [amountRepeat]));

        for (let i = amountRepeat - 1; i > 0; i--) {
            await editMessage(sentMessage, trans('model.command.tokenRain.incoming', [i]));
        }

        await sentMessage.edit(trans('model.command.tokenRain.begin'));
        await sentMessage.react(emojiKwiziq);

        const reactFilter = (reaction) => reaction.emoji.name === emojiKwiziq.name;

        sentMessage.awaitReactions(reactFilter, { time: 15 * SECOND }).then(async collected => {
            await sentMessage.edit(trans('model.command.tokenRain.over'));

            if (!collected.first() || !collected.first().users) {
                sentMessage.reactions.removeAll();
                return message.channel.send(trans('model.command.tokenRain.noWin'));
            }

            let acceptedReactionsCollected = collected.first().users.cache.filter(user => user.id !== sentMessage.author.id);

            if (acceptedReactionsCollected.size < 1) {
                sentMessage.reactions.removeAll();
                return message.channel.send(trans('model.command.tokenRain.noWin'));
            }

            collected.first().users.cache.filter(user => user.id !== sentMessage.author.id).forEach(async user => {
                const amountToken = Math.ceil(Math.random() * 5);

                await MemberToken.add([user.id], amountToken);

                message.channel.send(trans('model.command.tokenRain.win', [user.username, amountToken]));
            });
        });
    }
}

module.exports = new TokenRain();