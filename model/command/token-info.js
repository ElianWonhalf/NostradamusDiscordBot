const Discord = require('discord.js');
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
        this.category = CommandCategory.RESOURCE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message, args) {
        let user;

        if (args.length === 1) {
            member = Guild.findDesignatedMemberInMessage(message).foundMembers[0];

            if (member === undefined) {
                return message.reply(`J'ai... Aucune idée de qui ça pourrait être, désolé. / I... Have no idea who that could be, sorry.`);
            }

            user = member.user;
        } else if (args.length < 1) {
            user = message.author;
        } else {
            return message.reply(`J'ai... Aucune idée de qui ça pourrait être, désolé. / I... Have no idea who that could be, sorry.`);
        }

        const tokenInfo = await MemberToken.getCount(user.id);
        let amountToken;
        if (tokenInfo === undefined) {
            amountToken = 0;
        } else {
            amountToken = tokenInfo.amount_token;
        }

        const boardEmbed = new Discord.MessageEmbed()
            .setColor('#ffb8e6')
            .setTitle(`${emojiLongFox}[Token info]${emojiLongFox}`)
            .setAuthor(user.username, user.displayAvatarURL({ dynamic: true }))
            .setThumbnail(user.displayAvatarURL({ dynamic: true }))
            .setDescription(`Every token is a chance to win a lifetime subscription to ${emojiKwiziq} Kwiziq or a ${emojiDiscordNitro} Discord Nitro subscriptions !`)
            .addField(`Hey ${user.username} !`, `You have ${amountToken} token(s) !`)
            .addField(`check out the game of the day!`, `➡${Guild.eventAnnouncementsChannel.toString()}⬅`)
            .setTimestamp(new Date());

        message.channel.send(boardEmbed);
    }
}

module.exports = new TokenInfo();
