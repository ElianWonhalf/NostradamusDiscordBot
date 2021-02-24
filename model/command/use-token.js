const Logger = require('@lilywonhalf/pretty-logger');
const { Permissions } = require('discord.js');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');
const MemberToken = require('../member-token');
const Guild = require('../guild');

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
        const canApply = await MemberToken.canApply(message.author.id, args[0]);

        if (!canApply) {
            await message.react(emojiPollNo);
            return message.channel.send(`${trans('model.command.useToken.argError')}`);
        }

        await MemberToken.apply(message.author.id, args[0]).then(async () => {
            const appliedTokenInfo = await MemberToken.getAppliedCount(message.author.id);

            await message.react(emojiPollYes);
            message.channel.send(`${trans('model.command.useToken.amountAppliedTokens', [appliedTokenInfo[0].amount_applied])}`);
        }).catch(async (error) => {
            await message.react(emojiPollNo);
            Logger.exception(error);
        });
    }
}

module.exports = new useToken();
