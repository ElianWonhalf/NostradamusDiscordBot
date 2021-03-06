const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');
const MemberToken = require('../member-token');

class useToken
{
    static instance = null;

    constructor() {
        if (useToken.instance !== null) {
            return useToken.instance;
        }

        this.aliases = ['usetoken', 'uset'];
        this.category = CommandCategory.RESOURCE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        const emojiPollYes = bot.emojis.cache.find(emoji => emoji.name === 'pollyes');
        const emojiPollNo = bot.emojis.cache.find(emoji => emoji.name === 'pollno');

        if (args.length < 0) {
            return;
        }

        args[0] = parseInt(args[0]);
        const hasEnoughTokens = await MemberToken.hasEnoughTokens(message.author.id, args[0]);

        if (!hasEnoughTokens) {
            await message.react(emojiPollNo);

            return message.channel.send(trans('model.command.useToken.argError'));
        }

        await MemberToken.useTokens(message.author.id, args[0]);

        const usedTokenInfo = await MemberToken.getUsedCount(message.author.id);

        await message.react(emojiPollYes);

        message.channel.send(trans('model.command.useToken.amountUsedTokens', [usedTokenInfo[0].amount_used]));
    }
}

module.exports = new useToken();
