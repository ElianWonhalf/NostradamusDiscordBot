const Logger = require('@lilywonhalf/pretty-logger');
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
const emojiRight = '➡';
const emojiLeft = '⬅';

let page = 0;
let maxPages = 1;
const rowByPage = 5;
const arrayEmbeds = [];

/**
 * 
 * @param {Message} message 
 * @param {Array} tokenRanking 
 * 
 * @return {Embed}
 */
function getEmbed(message, tokenRanking) {
    if (arrayEmbeds[page] !== undefined) {
        return arrayEmbeds[page];
    }

    const boardEmbed = new Discord.MessageEmbed();

    boardEmbed.setColor('#ffb8e6')
        .setTitle(`${emojiLongFox}[Token board]${emojiLongFox}`)
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setDescription(`Every token is a chance to win a lifetime subscription to ${emojiKwiziq} Kwiziq or a ${emojiDiscordNitro} Discord Nitro subscriptions !`)
        .setTimestamp(new Date());

    for (let i = page * rowByPage; i < (page + 1) * rowByPage; i++) {
        if (tokenRanking[i] !== undefined) {
            boardEmbed.addField(`${tokenRanking[i].member.user.username}`, `${tokenRanking[i].amount_token} token(s)`);
        }
    }

    boardEmbed.addField(`check out the game of the day!`, `➡${Guild.eventAnnouncementsChannel.toString()}⬅`);

    arrayEmbeds.push(boardEmbed);
    return boardEmbed;
}

/**
 * @return {Array}
 */
function getReactEmojis() {
    if (page < 1 && maxPages === 1) {
        return [emojiFoxBottom, emojiFoxBody, emojiFoxHead];
    } else if (page < 1) {
        return[emojiRight];
    } else if (page === maxPages - 1) {
        return [emojiLeft];
    } else {
        return [emojiLeft, emojiRight];
    }
}

/**
 * 
 * @param {Message} message 
 * @param {Embed} embededMsg 
 * @param {Array} tokenRanking 
 */
const addReactToEmbed = (message, embededMsg, tokenRanking) => {
    getReactEmojis().map(emoji => embededMsg.react(emoji));

    const reactFilter = (reaction, user) => user.id === message.author.id && getReactEmojis().includes(reaction.emoji.name);

    embededMsg.awaitReactions(reactFilter, { max: 1, maxEmojis: 1, time: 15000 }).then(collectedReactions => {
        if (!collectedReactions.first()) {
            embededMsg.reactions.removeAll();
        } else {
            checkReaction(collectedReactions.first()._emoji.name);
            embededMsg.reactions.removeAll().then(addReactToEmbed(message, embededMsg, tokenRanking));

            const newEmbed = getEmbed(message, tokenRanking);
            embededMsg.edit(newEmbed);
        }
    });
};

/**
 * 
 * @param {Emoji} emoji 
 */
function checkReaction(emoji) {
    if (emoji) {
        switch (emoji) {
            case '➡':
                if (page < maxPages) {
                    page++;
                }
                break;
            case '⬅':
                if (page > 0) {
                    page--;
                }
                break;
        }
    }
}

class TokenBoard
{
    static instance = null;

    constructor() {
        if (TokenBoard.instance !== null) {
            return TokenBoard.instance;
        }

        this.aliases = [];
        this.category = CommandCategory.RESOURCE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        const tokenRanking = await MemberToken.getCount();

        if (tokenRanking === undefined) {
            return;
        }

        for (let row of tokenRanking) {
            row.member = await Guild.discordGuild.members.fetch(row.user_id).catch(exception => {
                Logger.error(exception.toString());
    
                return null;
            });
        }

        maxPages = Math.ceil(tokenRanking.length / rowByPage);

        const boardEmbed = getEmbed(message, tokenRanking);

        message.channel.send(boardEmbed).then(embededMsg => addReactToEmbed(message, embededMsg, tokenRanking));
    }
}

module.exports = new TokenBoard();
