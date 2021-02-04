const fs = require('fs');
const Discord = require('discord.js');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');
const MemberToken = require('../member-token');
const Guild = require('../guild');

const emojiLuckyLeaf = ('🍀');
const emojiKwiziq = bot.emojis.cache.find(emoji => emoji.name === 'kwiziq');
const emojiFoxBottom = bot.emojis.cache.find(emoji => emoji.name === 'foxlong3');
const emojiFoxBody = bot.emojis.cache.find(emoji => emoji.name === 'foxlong2');
const emojiFoxHead = bot.emojis.cache.find(emoji => emoji.name === 'foxlong1');
const emojiLongFox = `${emojiFoxBottom}${emojiFoxBody}${emojiFoxHead}`;

const arrayEmojis = [emojiFoxBottom, emojiFoxBody, emojiFoxHead, emojiFoxBottom, emojiFoxBody, emojiFoxHead, emojiFoxBottom, emojiLuckyLeaf, emojiFoxBody, emojiFoxHead];

const MAX_ATTEMPT = 5;
const COOLDOWN_DURATION = 43200000;

const saveAttempts = (data) => {
    fs.writeFileSync('./cache/attempts-lucky-fox/attempts.json', JSON.stringify(data));
};

/**
 * @returns {object|null}
 */
const getAttempts = () => {
    let data = null;

    if (fs.existsSync('./cache/attempts-lucky-fox/attempts.json')) {
        data = require('../../cache/attempts-lucky-fox/attempts.json');
    }

    return data;
};

/**
 * 
 * @param {Int} max 
 * 
 * @return {Int}
 */
function getRandomNumber(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

/**
 * 
 * @param {Int} amount 
 * 
 * @return {Array}
 */
function getRandomEmoji(amount) {
    const arrayKwiziqResult = [6, 9, 96, 69];
    let arrayResult = [];
    
    for (let i = 0; i < amount; i++) {
        const randomNumber = getRandomNumber(101);
        if (arrayKwiziqResult.includes(randomNumber) && !arrayResult.includes(emojiKwiziq)) {
            arrayResult.push(emojiKwiziq);
        } else {
            arrayResult.push(arrayEmojis[randomNumber % 10]);
        }
    }

    return arrayResult;
}

/**
 * 
 * @param {Message} botMessage 
 * @param {Emoji} emoji 
 * 
 * @return {Promise}
 */
function displayEmojis(botMessage, emoji) {
    return new Promise(async (resolve, reject) => {
        await botMessage.edit(`${botMessage.content}${emoji}`);
        setTimeout(resolve, 500);
    });
}

/**
 * 
 * @param {Array} emojis 
 * 
 * @return {Object}
 */
function getDrawResult(emojis) {
    const result = { kwiziq: false, tokenAmount: 0, luckyLeafAmount: 0, longfox: { large: 0, medium: 0, small: 0, baby: { amount: 0, index: [] } } };

    for (let i = 0; i < emojis.length; i++) {
        let currentEmoji = emojis[i];

        if (currentEmoji === emojiKwiziq) {
            result.tokenAmount++;
            result.kwiziq = true;
        } else if (isFoxBottom(currentEmoji)) {
            let nextEmoji = emojis[i + 1];

            if (isFoxBody(nextEmoji)) {
                // 1 body
                let previousEmoji = emojis[i + 1];
                nextEmoji = emojis[i + 2];

                if (isFoxBody(nextEmoji)) {
                    // 2 body
                    previousEmoji = emojis[i + 2];
                    nextEmoji = emojis[i + 3];

                    if (isFoxBody(nextEmoji)) {
                        // 3 body
                        previousEmoji = emojis[i + 3];
                        nextEmoji = emojis[i + 4];

                        if (isFoxhead(nextEmoji)) {
                            result.tokenAmount = 4;
                            result.longfox.large++;
                            result.luckyLeafAmount = transformLuckyLeaf(i + 4, 'large', emojis);
                            return result;
                        } else if (isFourLeaf(previousEmoji)) {
                            result.tokenAmount = 2;
                            result.longfox.medium++;
                            result.luckyLeafAmount = transformLuckyLeaf(i + 3, 'medium', emojis);
                            return result;
                        }
                    } else if (isFoxhead(nextEmoji)) {
                        result.tokenAmount = 2;
                        result.longfox.medium++;
                        result.luckyLeafAmount = transformLuckyLeaf(i + 3, 'medium', emojis);
                        return result;
                    } else if (isFourLeaf(previousEmoji)) {
                        result.tokenAmount = 1;
                        result.longfox.small++;
                        result.luckyLeafAmount = transformLuckyLeaf(i + 2, 'small', emojis);
                        return result;
                    }
                } else if (isFoxhead(nextEmoji)) {
                    result.tokenAmount = 1;
                    result.longfox.small++;
                    result.luckyLeafAmount = transformLuckyLeaf(i + 2, 'small', emojis);
                    return result;
                } else if (isFourLeaf(previousEmoji)) {
                    result.longfox.baby.amount++;
                    result.longfox.baby.index.push(i + 1);
                }
            } else if (isFoxhead(nextEmoji)) {
                result.longfox.baby.amount++;
                result.longfox.baby.index.push(i + 1);
            }
        }
    }

    if (result.longfox.baby.amount > 1) {
        result.tokenAmount = 1;
        result.luckyLeafAmount = transformLuckyLeaf(result.longfox.baby.index[0], 'baby', emojis);
        result.luckyLeafAmount += transformLuckyLeaf(result.longfox.baby.index[1], 'baby', emojis);
    }

    return result;
}

/**
 * 
 * @param {Int} index 
 * @param {String} longFoxType 
 * @param {Array} emojis 
 * 
 * @return {Int}
 */
function transformLuckyLeaf(index, longFoxType, emojis) {
    let luckyLeafAmount = 0;

    switch (longFoxType) {
        case 'large':
            luckyLeafAmount = getLuckyLeafAmount([emojis[index], emojis[index - 1], emojis[index - 2], emojis[index - 3], emojis[index - 4]]);
            emojis[index] = emojiFoxHead;
            emojis[index - 1] = emojiFoxBody;
            emojis[index - 2] = emojiFoxBody;
            emojis[index - 3] = emojiFoxBody;
            emojis[index - 4] = emojiFoxBottom;
        break;

        case 'medium':
            luckyLeafAmount = getLuckyLeafAmount([emojis[index], emojis[index - 1], emojis[index - 2], emojis[index - 3]]);
            emojis[index] = emojiFoxHead;
            emojis[index - 1] = emojiFoxBody;
            emojis[index - 2] = emojiFoxBody;
            emojis[index - 3] = emojiFoxBottom;
        break;

        case 'small':
            luckyLeafAmount = getLuckyLeafAmount([emojis[index], emojis[index - 1], emojis[index - 2]]);
            emojis[index] = emojiFoxHead;
            emojis[index - 1] = emojiFoxBody;
            emojis[index - 2] = emojiFoxBottom;
        break;

        case 'baby':
            luckyLeafAmount = getLuckyLeafAmount([emojis[index], emojis[index - 1]]);
            emojis[index] = emojiFoxHead;
            emojis[index - 1] = emojiFoxBottom;
        break;
    }
    return luckyLeafAmount;
}

/**
 * 
 * @param {Array} emojis
 * 
 * @return {int}
 */
function getLuckyLeafAmount(emojis) {
    const result = emojis.filter(emoji => emoji === emojiLuckyLeaf);
    return result.length;
}

/**
 * 
 * @param {Emoji} emoji 
 * 
 * @return {boolean}
 */
function isFoxBottom(emoji) {
    if (emoji && (emoji === emojiFoxBottom || emoji === emojiLuckyLeaf)) {
        return true;
    }

    return false;
}

/**
 * 
 * @param {Emoji} emoji 
 * 
 * @return {boolean}
 */
function isFoxBody(emoji) {
    if (emoji && (emoji === emojiFoxBody || emoji === emojiLuckyLeaf)) {
        return true;
    }

    return false;
}

/**
 * 
 * @param {Emoji} emoji 
 * 
 * @return {boolean}
 */
function isFoxhead(emoji) {
    if (emoji && (emoji === emojiFoxHead || emoji === emojiLuckyLeaf)) {
        return true;
    }

    return false;
}

/**
 * 
 * @param {Emoji} emoji 
 * 
 * @return {boolean}
 */
function isFourLeaf(emoji) {
    if (emoji && emoji === emojiLuckyLeaf) {
        return true;
    }

    return false;
}

/**
 * 
 * @param {Message} message 
 * @param {Object} result 
 * 
 * @return {Embed}
 */
async function editEmbedWithResult(message, result) {
    const embedResult = new Discord.MessageEmbed()
        .setColor('#ffb8e6')
        .setTitle(`${emojiLongFox}${emojiLuckyLeaf}[Lucky Fox]${emojiLuckyLeaf}${emojiLongFox}`)
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setFooter('.lfox is faster')
        .setTimestamp(new Date());

    if (result.tokenAmount > 0) {
        const totalToken = result.tokenAmount + result.luckyLeafAmount;
        embedResult.setDescription(`Hey, you won ${totalToken} token(s) !`);
    } else {
        embedResult.setDescription(`Tough luck...`);
    }

    if (result.kwiziq) {
        embedResult.addField(`${emojiKwiziq}`, 'Kwiziq give you a hand ! ... and 1 token');
    }

    if (result.longfox.baby.amount > 1) {
        embedResult.addField(`${emojiFoxBottom}${emojiFoxHead}`, 'These babies longfox gave you 1 token !');
    }

    if (result.longfox.small > 0) {
        embedResult.addField(`${emojiFoxBottom}${emojiFoxBody}${emojiFoxHead}`, 'This longfox give you 1 token !');
    }

    if (result.longfox.medium > 0) {
        embedResult.addField(`${emojiFoxBottom}${emojiFoxBody}${emojiFoxBody}${emojiFoxHead}`, 'This prettylongfox give you 2 token !!');
    }

    if (result.longfox.large > 0) {
        embedResult.addField(`${emojiFoxBottom}${emojiFoxBody}${emojiFoxBody}${emojiFoxBody}${emojiFoxHead}`, 'This damnbigboylongfox give you 4 token !!!!');
    }

    if (result.luckyLeafAmount > 0) {
        embedResult.addField(`${emojiLuckyLeaf}`, `These four leaf clovers turn into ${result.luckyLeafAmount} token(s)`);
    }

    embedResult.addField(`check out the game of the day!`, `➡${Guild.eventAnnouncementsChannel.toString()}⬅`);

    return embedResult;
}

/**
 * 
 * @param {int} userId 
 * 
 * @return {boolean} 
 */
function canPlay(userId) {
    let dataAttempts = getAttempts();
    if (!dataAttempts) {
        dataAttempts = {};
    }

    if (!dataAttempts[userId]) {
        dataAttempts[userId] = {numberAttempts: 0, firstAttempt: Date.now()};
    }

    if (dataAttempts[userId].numberAttempts >= MAX_ATTEMPT) {
        if (canResetAttempt(dataAttempts[userId].firstAttempt)) {
            dataAttempts[userId].numberAttempts = 0;
        } else {
            return false;
        }
    }

    dataAttempts[userId].numberAttempts += 1;
    saveAttempts(dataAttempts);
    return true;
}

/**
 * 
 * @param {int} timestampFirstAttempt 
 * 
 * @return {boolean}
 */
function canResetAttempt(timestampFirstAttempt) {
    const now = Date.now();

    if (now - timestampFirstAttempt >= COOLDOWN_DURATION) {
        return true;
    }

    return false;
}

class LuckyFox
{
    static instance = null;

    constructor() {
        if (LuckyFox.instance !== null) {
            return LuckyFox.instance;
        }

        this.aliases = ['lfox'];
        this.category = CommandCategory.RESOURCE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        if (!canPlay(message.author.id)) {
            return message.channel.send(`I take a break, wait a little like ... 12 hour`);
        }

        // contains random emojis and will be show first
        const initialRandomEmojis = getRandomEmoji(5);
        // contains same as randomEmojis array but will be edited to transform four leaf into part of the fox
        const randomEmojis = initialRandomEmojis.filter(() => true);

        const result = getDrawResult(randomEmojis);

        const embed = new Discord.MessageEmbed()
            .setColor('#ffb8e6')
            .setTitle(`${emojiLongFox}${emojiLuckyLeaf}[Lucky Fox]${emojiLuckyLeaf}${emojiLongFox}`)
            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setDescription(`Ok, Let's try something ...`)
            .addField(`check out the game of the day!`, `➡${Guild.eventAnnouncementsChannel.toString()}⬅`)
            .setFooter('.lfox is faster')
            .setTimestamp(new Date());

        message.channel.send(embed).then(async botMessage => {
            for (let emoji of initialRandomEmojis) {
                await displayEmojis(botMessage, emoji);
            }

            const editedEmbed = await editEmbedWithResult(message, result);

            await botMessage.edit(editedEmbed);
            await botMessage.edit(`${randomEmojis[0]}${randomEmojis[1]}${randomEmojis[2]}${randomEmojis[3]}${randomEmojis[4]}`);

            const totalToken = result.tokenAmount + result.luckyLeafAmount;
            for (let i = 0; i < totalToken; i++) {
                await MemberToken.add([message.author.id]).then(async () => {
                    await Guild.eventChatChannel.send(`${message.author.username} a gagné un jeton !`);
                });
            }
        });
    }
}

module.exports = new LuckyFox();
