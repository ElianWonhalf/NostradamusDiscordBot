const { MessageEmbed } = require('discord.js');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');
const MemberToken = require('../member-token');
const Guild = require('../guild');

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

        this.aliases = ['tokeninfo', 'tinfo'];
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

        const tokenInfo = await MemberToken.getMemberTokenInfo(user.id);
        const currentTokenAmount = tokenInfo.length > 0 ? (tokenInfo[0].amount ?? 0) : 0;
        const allTimeTokenAmount = tokenInfo.length > 0 ? (tokenInfo[0].all_time_amount ?? 0) : 0;
        const usedTokenAmount = tokenInfo.length > 0 ? (tokenInfo[0].amount_used ?? 0) : 0;

        const boardEmbed = new MessageEmbed()
            .setColor('#ffb8e6')
            .setTitle(`${emojiLongFox}[${user.username}'s token info]${emojiLongFox}`)
            .setAuthor(user.username, user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setDescription(trans('model.command.tokenInfo.reward'))
            .addField(trans('model.command.tokenInfo.tokens.currentTokenTitle'), trans('model.command.tokenInfo.tokens.currentTokenAmount', [currentTokenAmount]))
            .addField(trans('model.command.tokenInfo.tokens.allTimeTokenTitle'), trans('model.command.tokenInfo.tokens.allTimeTokenAmount', [allTimeTokenAmount]))
            .addField(trans('model.command.tokenInfo.tokens.usedTokenTitle'), trans('model.command.tokenInfo.tokens.usedTokenAmount', [usedTokenAmount]))
            .addField(trans('model.command.tokenInfo.announcementsInfo'), `➡${Guild.eventAnnouncementsChannel.toString()}⬅`)
            .setFooter(trans('model.command.tokenInfo.footerInfo'))
            .setTimestamp(new Date());

        await message.channel.send(boardEmbed);
    }
}

module.exports = new TokenInfo();
