const { writeFileSync, existsSync, mkdirSync } = require('fs');
const { MessageEmbed } = require('discord.js');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');
const MemberToken = require('../member-token');
const Guild = require('../guild');

const cachelessRequire = (path) => {
    if (typeof path === 'string') {
        delete require.cache[require.resolve(path)];
    }

    return typeof path === 'string' ? require(path) : null;
};

const emojiKwiziq = bot.emojis.cache.find(emoji => emoji.name === 'kwiziq');
let emojiLuckyLeaf = '🍀';
let emojiFoxBottom = bot.emojis.cache.find(emoji => emoji.name === 'foxlong3');
let emojiFoxBody = bot.emojis.cache.find(emoji => emoji.name === 'foxlong2');
let emojiFoxHead = bot.emojis.cache.find(emoji => emoji.name === 'foxlong1');
let emojiLongFox = `${emojiFoxBottom}${emojiFoxBody}${emojiFoxHead}`;

let arrayEmojis = [emojiFoxBottom, emojiFoxBody, emojiFoxHead, emojiFoxBottom, emojiFoxBody, emojiFoxHead, emojiFoxBottom, emojiLuckyLeaf, emojiFoxBody, emojiFoxHead];

const MAX_ATTEMPT = 5;
const COOLDOWN_DURATION = 43200000;

const saveAttempts = (data) => {
    if (!existsSync('cache')) {
        mkdirSync('cache');
    }

    if (!existsSync('cache/attempts-lucky-fox')) {
        mkdirSync('cache/attempts-lucky-fox');
    }

    writeFileSync('./cache/attempts-lucky-fox/attempts.json', JSON.stringify(data));
};

/**
 * @returns {object|null}
 */
const getAttempts = () => {
    let data = null;

    if (existsSync('./cache/attempts-lucky-fox/attempts.json')) {
        data = cachelessRequire('../../cache/attempts-lucky-fox/attempts.json');
    }

    return data;
};

/**
 *
 * @param {int} timestampFirstAttempt
 *
 * @return {boolean}
 */
function canResetAttempt(timestampFirstAttempt) {
    const now = Date.now();
    return now >= timestampFirstAttempt + COOLDOWN_DURATION;
}

/**
 *
 * @param {string} userId
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

    if (canResetAttempt(dataAttempts[userId].firstAttempt)) {
        dataAttempts[userId].numberAttempts = 0;
    }

    if (dataAttempts[userId].numberAttempts >= MAX_ATTEMPT) {
        return false;
    }

    if (dataAttempts[userId].numberAttempts === 0) {
        dataAttempts[userId].firstAttempt = Date.now();
    }

    dataAttempts[userId].numberAttempts++;
    saveAttempts(dataAttempts);

    return true;
}

/**
 * 
 * @param {string} timestamp 
 * 
 * @return {string}
 */
function getTimeLeft(userId) {
    let dataAttempts = getAttempts();

    timestampTimeLeft = (dataAttempts[userId].firstAttempt + COOLDOWN_DURATION) - Date.now();
    timestampInSecond = Math.round(parseInt(timestampTimeLeft) / 1000);

    const hours = Math.floor(timestampInSecond / 3600);
    const minutes = Math.round((timestampInSecond % 3600) / 60);

    if (minutes === 60) {
        minutes = 0;
        hours++;
    }

    return `${hours}h ${minutes}min`;
}

/**
 *
 * @param {int} max
 *
 * @return {int}
 */
function getRandomNumber(max) {
    return Math.floor(Math.random() * max);
}

/**
 *
 * @param {int} amount
 *
 * @return {Array}
 */
function getRandomEmoji(amount) {
    const arrayKwiziqResult = [4, 13, 24, 42];
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
 */
function setupNewEmojis() {
    emojiLongFox = `${emojiFoxBottom}${emojiFoxBody}${emojiFoxHead}`;
    arrayEmojis = [emojiFoxBottom, emojiFoxBody, emojiFoxHead, emojiFoxBottom, emojiFoxBody, emojiFoxHead, emojiFoxBottom, emojiLuckyLeaf, emojiFoxBody, emojiFoxHead];
}

/**
 * 
 * @param {string} arg 
 */
function changeLongfoxTo(arg) {
    switch(arg) {
        case 'lgbt' :
            emojiFoxBottom = bot.emojis.cache.find(emoji => emoji.name === 'lgbtfox1');
            emojiFoxBody = bot.emojis.cache.find(emoji => emoji.name === 'lgbtfox2');
            emojiFoxHead = bot.emojis.cache.find(emoji => emoji.name === 'lgbtfox3');
            setupNewEmojis();
            break;
        
        case 'frog' :
            emojiFoxBottom = bot.emojis.cache.find(emoji => emoji.name === 'frogchair3');
            emojiFoxBody = bot.emojis.cache.find(emoji => emoji.name === 'frogchair2');
            emojiFoxHead = bot.emojis.cache.find(emoji => emoji.name === 'frogchair1');
            setupNewEmojis();
            break;

        default :
            return;
    }
}

/**
 *
 * @param {Message} botMessage
 * @param {Emoji|string} emoji
 *
 * @return {Promise}
 */
function displayEmojis(botMessage, emoji) {
    return new Promise(async resolve => {
        await botMessage.edit(`${botMessage.content}${emoji}`);
        setTimeout(resolve, 500);
    });
}

/**
 *
 * @param {Emoji|string} emoji
 *
 * @return {boolean}
 */
function isFoxBottom(emoji) {
    return emoji && (emoji === emojiFoxBottom || emoji === emojiLuckyLeaf);
}

/**
 *
 * @param {Emoji|string} emoji
 *
 * @return {boolean}
 */
function isFoxBody(emoji) {
    return emoji && (emoji === emojiFoxBody || emoji === emojiLuckyLeaf);
}

/**
 *
 * @param {Emoji|string} emoji
 *
 * @return {boolean}
 */
function isFoxhead(emoji) {
    return emoji && (emoji === emojiFoxHead || emoji === emojiLuckyLeaf);
}

/**
 *
 * @param {Emoji|string} emoji
 *
 * @return {boolean}
 */
function isFourLeaf(emoji) {
    return emoji && emoji === emojiLuckyLeaf;
}

/**
 * 
 * @param {Array} emojis 
 * 
 * @return {Object}
 */
function includeSuperLongFox(emojis) {
    const result = { exists: false, indexHead: null};

    if (isFoxBottom(emojis[0]) && isFoxBody(emojis[1]) && isFoxBody(emojis[2]) && isFoxBody(emojis[3]) && isFoxhead(emojis[4])) {
        result.exists = true;
        result.indexHead = 4;
    }

    return result;
}

/**
 * 
 * @param {Array} emojis 
 * 
 * @return {Object}
 */
function includeLongerFox(emojis) {
    const result = { exists: false, indexHead: null};

    if (isFoxBottom(emojis[0]) && isFoxBody(emojis[1]) && isFoxBody(emojis[2]) && isFoxhead(emojis[3])) {
        result.exists = true;
        result.indexHead = 3;
    } else if (isFoxBottom(emojis[1]) && isFoxBody(emojis[2]) && isFoxBody(emojis[3]) && isFoxhead(emojis[4])) {
        result.exists = true;
        result.indexHead = 4;
    }

    return result;
}

/**
 * 
 * @param {Array} emojis 
 * 
 * @return {Object}
 */
function includeLongFox(emojis) {
    const result = { exists: false, indexHead: null};

    if (isFoxBottom(emojis[0]) && isFoxBody(emojis[1]) && isFoxhead(emojis[2])) {
        result.exists = true;
        result.indexHead = 2;
    } else if (isFoxBottom(emojis[1]) && isFoxBody(emojis[2]) && isFoxhead(emojis[3])) {
        result.exists = true;
        result.indexHead = 3;
    } else if (isFoxBottom(emojis[2]) && isFoxBody(emojis[3]) && isFoxhead(emojis[4])) {
        result.exists = true;
        result.indexHead = 4;
    }

    return result;
}

/**
 * 
 * @param {Array} emojis 
 * 
 * @return {Object}
 */
function includeTwoBabyLongFox(emojis) {
    const result = { exists: false, indexHead: []};
    let emojisToString = '';

    emojis.forEach(emoji => {
        if (emoji === emojiLuckyLeaf) {
            emojisToString += "0";
        }
        if (emoji === emojiFoxBottom) {
            emojisToString += "1";
        }
        if (emoji === emojiFoxBody) {
            emojisToString += "2";
        }
        if (emoji === emojiFoxHead) {
            emojisToString += "3";
        }
    });
    
    const possibleMatch = [`13`, `10`, `03`, `00`];
    let babyFoxAmount = 0;

    for (let i = 0; i < possibleMatch.length; i++) {
        let index = emojisToString.indexOf(possibleMatch[i]);
        
        if (index !== -1) {
            babyFoxAmount++;
            result.indexHead.push(index + 1);

            let secondIndex = emojisToString.indexOf(possibleMatch[i], (index + 1));
            console.log(possibleMatch[i]);
            if (secondIndex !== -1) {
                babyFoxAmount++;
                result.indexHead.push(secondIndex + 1);
            }
        }

        if (babyFoxAmount > 1) {
            result.exists = true;
            break;
        }
    }

    return result;
}

/**
 *
 * @param {Array} emojis
 *
 * @return {Object}
 */
function getDrawResult(emojis) {
    const result = {
        kwiziq: false,
        tokenAmount: 0,
        luckyLeafAmount: 0,
        longfox: {
            large: 0,
            medium: 0,
            small: 0,
            baby: 0
        }
    };

    if (emojis.includes(emojiKwiziq)) {
        result.tokenAmount++;
        result.kwiziq = true;
    }

    const superLongFox = includeSuperLongFox(emojis);

    if (superLongFox.exists) {
        result.tokenAmount += 4;
        result.longfox.large++;
        result.luckyLeafAmount += transformLuckyLeaf(superLongFox.indexHead, 'large', emojis);
        return result;
    }

    const longerFox = includeLongerFox(emojis);

    if (longerFox.exists) {
        result.tokenAmount += 2;
        result.longfox.medium++;
        result.luckyLeafAmount += transformLuckyLeaf(longerFox.indexHead, 'medium', emojis);
        return result;
    }

    const longFox = includeLongFox(emojis);

    if (longFox.exists) {
        result.tokenAmount += 1;
        result.longfox.small++;
        result.luckyLeafAmount += transformLuckyLeaf(longFox.indexHead, 'small', emojis);
        return result;
    }

    const foxBabies = includeTwoBabyLongFox(emojis);

    if (foxBabies.exists) {
        result.tokenAmount += 1;
        result.longfox.baby++;
        result.luckyLeafAmount += transformLuckyLeaf(foxBabies.indexHead[0], 'baby', emojis);
        result.luckyLeafAmount += transformLuckyLeaf(foxBabies.indexHead[1], 'baby', emojis);
        return result;
    }

    return result;
}

/**
 *
 * @param {int} index
 * @param {String} longFoxType
 * @param {Array} emojis
 *
 * @return {int}
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
 * @param {Message} message
 * @param {Object} result
 *
 * @return {MessageEmbed}
 */
async function editEmbedWithResult(message, result) {
    const embedResult = new MessageEmbed()
        .setColor('#ffb8e6')
        .setTitle(`${emojiLongFox}${emojiLuckyLeaf}[Lucky Fox]${emojiLuckyLeaf}${emojiLongFox}`)
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setTimestamp(new Date());

    if (result.tokenAmount > 0) {
        const totalToken = result.tokenAmount + result.luckyLeafAmount;
        embedResult.setDescription(trans('model.command.luckyFox.result.win', [totalToken]));
    } else {
        embedResult.setDescription(trans('model.command.luckyFox.result.lose'));
    }

    if (result.kwiziq) {
        embedResult.addField(`${emojiKwiziq}`, trans('model.command.luckyFox.result.kwiziq'));
    }

    if (result.longfox.small > 0) {
        embedResult.addField(`${emojiFoxBottom}${emojiFoxBody}${emojiFoxHead}`, trans('model.command.luckyFox.result.longFoxSmall'));
    } else if (result.longfox.baby > 0) {
        embedResult.addField(`${emojiFoxBottom}${emojiFoxHead}`, trans('model.command.luckyFox.result.babyFox'));
    } else if (result.longfox.medium > 0) {
        embedResult.addField(`${emojiFoxBottom}${emojiFoxBody}${emojiFoxBody}${emojiFoxHead}`, trans('model.command.luckyFox.result.longFoxMedium'));
    } else if (result.longfox.large > 0) {
        embedResult.addField(`${emojiFoxBottom}${emojiFoxBody}${emojiFoxBody}${emojiFoxBody}${emojiFoxHead}`, trans('model.command.luckyFox.result.longFoxLarge'));
    }

    if (result.luckyLeafAmount > 0) {
        embedResult.addField(`${emojiLuckyLeaf}`, trans('model.command.luckyFox.result.luckyLeaf', [result.luckyLeafAmount]));
    }

    embedResult.addField(trans('model.command.luckyFox.gameOfTheDay'), `➡${Guild.eventAnnouncementsChannel.toString()}⬅`);

    return embedResult;
}

function getEmbedPleaseWait(userId) {
    const embedResult = new MessageEmbed()
        .setColor('#ffb8e6')
        .setTitle(`${emojiLongFox}${emojiLuckyLeaf}[Lucky Fox]${emojiLuckyLeaf}${emojiLongFox}`)
        .addField(
            trans('model.command.luckyFox.pleaseWait'),
            trans('model.command.luckyFox.timeLeft', [getTimeLeft(userId)])
        )
        .setTimestamp(new Date());

    return embedResult;
}

class LuckyFox
{
    static instance = null;

    constructor() {
        if (LuckyFox.instance !== null) {
            return LuckyFox.instance;
        }

        this.aliases = ['lfox'];
        this.category = CommandCategory.FUN;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message, args) {
        if (args.length > 0) {
            changeLongfoxTo(args[0]);
        }

        if (!canPlay(message.author.id)) {
            return message.channel.send(getEmbedPleaseWait(message.author.id));
        }

        // contains random emojis and will be shown first
        const initialRandomEmojis = getRandomEmoji(5);
        // contains same as randomEmojis array but will be edited to transform four leaf into part of the fox
        const randomEmojis = initialRandomEmojis.filter(() => true);

        const result = getDrawResult(randomEmojis);

        const embed = new MessageEmbed()
            .setColor('#ffb8e6')
            .setTitle(`${emojiLongFox}${emojiLuckyLeaf}[Lucky Fox]${emojiLuckyLeaf}${emojiLongFox}`)
            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setDescription(trans('model.command.luckyFox.loadingResult'))
            .addField(trans('model.command.luckyFox.gameOfTheDay'), `➡${Guild.eventAnnouncementsChannel.toString()}⬅`)
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
                    return Guild.eventChatChannel.send(trans('model.command.luckyFox.wonAToken', [message.author.username]));
                });
            }
        });
    }
}

module.exports = new LuckyFox();
