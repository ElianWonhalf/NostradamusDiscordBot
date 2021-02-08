const { MessageEmbed } = require('discord.js');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');
const MemberToken = require('../member-token');
const Guild = require('../guild');

const emojiKwiziq = bot.emojis.cache.find(emoji => emoji.name === 'kwiziq');
const emojiDiscordNitro = bot.emojis.cache.find(emoji => emoji.name === 'nitro');
const emojiFoxBottom = bot.emojis.cache.find(emoji => emoji.name === 'foxlong3');
const emojiFoxBody = bot.emojis.cache.find(emoji => emoji.name === 'foxlong2');
const emojiFoxHead = bot.emojis.cache.find(emoji => emoji.name === 'foxlong1');
const emojiLongFox = `${emojiFoxBottom}${emojiFoxBody}${emojiFoxHead}`;

class TokenInfo
{
    static instance = null;

    constructor() {
        if (TokenInfo.instance !== null) {
            return TokenInfo.instance;
        }

        this.aliases = [];
        this.category = CommandCategory.FUN;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        let user;

        if (args.length === 1) {
            const member = Guild.findDesignatedMemberInMessage(message).foundMembers[0];

            if (!member || !member.user) {
                return message.reply(trans('model.command.tokenInfo.memberNotFound'));
            }

            user = member.user;
        } else if (args.length < 1) {
            user = message.author;
        } else {
            return message.reply(trans('model.command.tokenInfo.memberNotFound'));
        }

        const tokenInfo = await MemberToken.getCount(user.id);
        let amountToken;

        if (!tokenInfo.amount_token) {
            amountToken = 0;
        } else {
            amountToken = tokenInfo.amount_token;
        }

        const boardEmbed = new MessageEmbed()
            .setColor('#ffb8e6')
            .setTitle(`${emojiLongFox}[Token info]${emojiLongFox}`)
            .setAuthor(user.username, user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setDescription(trans('model.command.tokenInfo.reward', [emojiKwiziq, emojiDiscordNitro]))
            .addField(trans('model.command.tokenInfo.tokens.user', [user.username]), trans('model.command.tokenInfo.tokens.amount', [amountToken]))
            .addField(trans('model.command.tokenInfo.gameOfTheDay'), `➡${Guild.eventAnnouncementsChannel.toString()}⬅`)
            .setTimestamp(new Date());

        await message.channel.send(boardEmbed);
    }
}

module.exports = new TokenInfo();
