const Logger = require('@lilywonhalf/pretty-logger');
const { MessageEmbed } = require('discord.js');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');
const MemberToken = require('../member-token');
const Guild = require('../guild');
const Config = require('../../config.json');

const emojiFoxBottom = bot.emojis.cache.find(emoji => emoji.name === 'foxlong3');
const emojiFoxBody = bot.emojis.cache.find(emoji => emoji.name === 'foxlong2');
const emojiFoxHead = bot.emojis.cache.find(emoji => emoji.name === 'foxlong1');
const emojiLongFox = `${emojiFoxBottom}${emojiFoxBody}${emojiFoxHead}`;
const emojiRight = '➡';
const emojiLeft = '⬅';

let page = 0;
let maxPages = 1;
const rowByPage = 7;
const arrayEmbeds = [];

/**
 *
 * @param {Message} message
 * @param {Array} tokenRanking
 *
 * @return {MessageEmbed}
 */
function getEmbed(message, tokenRanking) {
    if (arrayEmbeds[page]) {
        return arrayEmbeds[page];
    }

    const boardEmbed = new MessageEmbed();

    boardEmbed.setColor('#ffb8e6')
        .setTitle(`${emojiLongFox}[Token board]${emojiLongFox}`)
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setDescription(trans('model.command.tokenBoard.reward'))
        .setFooter(trans('model.command.tokenBoard.footerInfo'))
        .setTimestamp(new Date());

    for (let i = page * rowByPage; i < (page + 1) * rowByPage; i++) {
        if (tokenRanking[i]) {
            boardEmbed.addField(tokenRanking[i].member.user.username, trans('model.command.tokenBoard.tokenRanking', [tokenRanking[i].amount]));
        }
    }

    boardEmbed.addField(trans('model.command.tokenBoard.announcementsInfo'), `➡${Guild.eventAnnouncementsChannel.toString()}⬅`);

    arrayEmbeds.push(boardEmbed);

    return boardEmbed;
}

/**
 * @return {Array}
 */
function getReactEmojis() {
    if (page < 1 && maxPages < 2) {
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
 * @param {Message} embeddedMessage
 * @param {Array} tokenRanking
 */
const addReactToEmbed = (message, embeddedMessage, tokenRanking) => {
    getReactEmojis().forEach(emoji => embeddedMessage.react(emoji));

    const reactFilter = (reaction, user) => user.id === message.author.id && getReactEmojis().includes(reaction.emoji.name);

    embeddedMessage.awaitReactions(reactFilter, { max: 1, maxEmojis: 1, time: 2 * MINUTE }).then(async collectedReactions => {
        if (!collectedReactions.first()) {
            embeddedMessage.reactions.removeAll();
        } else {
            checkReaction(collectedReactions.first().emoji.name);

            await embeddedMessage.reactions.removeAll().then(() => {
                addReactToEmbed(message, embeddedMessage, tokenRanking);
            });

            const newEmbed = getEmbed(message, tokenRanking);
            embeddedMessage.edit(newEmbed);
        }
    });
};

/**
 *
 * @param {Emoji|string} emoji
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

        this.aliases = ['tokenboard', 'tboard'];
        this.category = CommandCategory.FUN;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message, args) {
        const acceptedArgsValues = ['mod', 'mods', 'modo', 'modos', 'modérateur', 'modérateurs', 'moderator', 'moderators'];
        let tokenRanking = await MemberToken.getCount();

        if (!tokenRanking) {
            return;
        }

        for (let row of tokenRanking) {
            row.member = await Guild.discordGuild.members.fetch(row.user_id).catch(exception => {
                Logger.error(exception.toString());

                return null;
            });
        }

        tokenRanking = tokenRanking.filter(row => row && row.member);

        if (!args[0] || !acceptedArgsValues.includes(args[0])) {
            tokenRanking = tokenRanking.filter(row => !row.member.roles.cache.has(Config.roles.mod));
        }
        
        maxPages = Math.ceil(tokenRanking.length / rowByPage);

        const boardEmbed = getEmbed(message, tokenRanking);
        message.channel.send(boardEmbed).then(
            embeddedMessage => addReactToEmbed(message, embeddedMessage, tokenRanking)
        );
    }
}

module.exports = new TokenBoard();
