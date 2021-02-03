const Logger = require('@lilywonhalf/pretty-logger');
const Discord = require('discord.js');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');
const MemberToken = require('../member-token');
const Guild = require('../guild');

const emojiLuckyLeaf = ('🍀');
const emojiKwiziq = bot.emojis.cache.find(emoji => emoji.name === 'kwiziq');
const emojiFoxAss = bot.emojis.cache.find(emoji => emoji.name === 'foxlong3');
const emojiFoxBody = bot.emojis.cache.find(emoji => emoji.name === 'foxlong2');
const emojiFoxHead = bot.emojis.cache.find(emoji => emoji.name === 'foxlong1');
const emojiLongFox = `${emojiFoxAss}${emojiFoxBody}${emojiFoxHead}`;

const arrayEmojis = [emojiFoxAss, emojiFoxBody, emojiFoxHead, emojiFoxAss, emojiFoxBody, emojiFoxHead, emojiFoxAss, emojiLuckyLeaf, emojiFoxBody, emojiFoxHead];

let editedMessageContent = "";

function getRandomNumber(max) {
    return Math.floor(Math.random() * Math.floor(max));
}

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

const displayEmojis = (botMessage, message, result, emojis) => {
    const arrayEmojis = emojis;
    editedMessageContent += `${arrayEmojis.shift()}`;

    botMessage.edit(editedMessageContent);

    if (arrayEmojis.length < 1) {
        editedMessageContent = "";
        editEmbedWithResult(botMessage, message, result);
    } else {
        setTimeout(() => {
            displayEmojis(botMessage, message, result, arrayEmojis);
        }, 1000);
    }
};

function getDrawResult(emojis) {
    let result = {
        kwiziq: false,
        tokenAmount: 0,
        longfox: {
            baby: 0,
            small: 0,
            medium: 0,
            large: 0
        }
    };

    for (let i = 0; i < emojis.length; i++) {
        let currentEmoji = emojis[i];

        if (currentEmoji === emojiKwiziq) {
            result.tokenAmount++;
            result.kwiziq = true;
        } else if (isFoxAss(currentEmoji)) {
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
                            result.tokenAmount += 4;
                            result.longfox.large++;
                        } else if (isFourLeaf(previousEmoji)) {
                            result.tokenAmount += 2;
                            result.longfox.medium++;
                        }
                    } else if (isFoxhead(nextEmoji)) {
                        result.tokenAmount += 2;
                        result.longfox.medium++;
                    } else if (isFourLeaf(previousEmoji)) {
                        result.tokenAmount++;
                        result.longfox.small++;
                    }
                } else if (isFoxhead(nextEmoji)) {
                    result.tokenAmount++;
                    result.longfox.small++;
                } else if (isFourLeaf(previousEmoji)) {
                    result.longfox.baby++;
                }
            } else if (isFoxhead(nextEmoji)) {
                result.longfox.baby++;
            }
        }
    }

    if (result.longfox.baby > 1) {
        result.tokenAmount++;
    }

    return result;
}

function isFoxAss(emoji) {
    if (emoji && (emoji === emojiFoxAss || emoji === emojiLuckyLeaf)) {
        return true;
    }

    return false;
}

function isFoxBody(emoji) {
    if (emoji && (emoji === emojiFoxBody || emoji === emojiLuckyLeaf)) {
        return true;
    }

    return false;
}

function isFoxhead(emoji) {
    if (emoji && (emoji === emojiFoxHead || emoji === emojiLuckyLeaf)) {
        return true;
    }

    return false;
}

function isFourLeaf(emoji) {
    if (emoji && emoji === emojiLuckyLeaf) {
        return true;
    }

    return false;
}

async function editEmbedWithResult(botMessage, message, result) {
    const embedResult = new Discord.MessageEmbed()
        .setColor('#ffb8e6')
        .setTitle(`${emojiLongFox}${emojiLuckyLeaf}[Lucky Fox]${emojiLuckyLeaf}${emojiLongFox}`)
        .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
        .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
        .setFooter(`${emojiLuckyLeaf} = JOKER`)
        .setTimestamp(new Date());

    if (result.tokenAmount > 0) {
        embedResult.setDescription(`Hey, you won ${result.tokenAmount} token(s) !`);
    } else {
        embedResult.setDescription(`Tough luck...`);
    }

    if (result.kwiziq) {
        embedResult.addField(`${emojiKwiziq}`, 'Kwiziq give you a hand ! ... and 1 token');
    }

    if (result.longfox.baby > 1) {
        embedResult.addField(`${emojiFoxAss}${emojiFoxHead}`, 'Those baby longfox give you 1 token !');
    }

    if (result.longfox.small > 0) {
        embedResult.addField(`${emojiFoxAss}${emojiFoxBody}${emojiFoxHead}`, 'This longfox give you 1 token !');
    }

    if (result.longfox.medium > 0) {
        embedResult.addField(`${emojiFoxAss}${emojiFoxBody}${emojiFoxBody}${emojiFoxHead}`, 'This prettylongfox give you 2 token !!');
    }

    if (result.longfox.large > 0) {
        embedResult.addField(`${emojiFoxAss}${emojiFoxBody}${emojiFoxBody}${emojiFoxBody}${emojiFoxHead}`, 'This damnbigboylongfox give you 4 token !!!!');
    }

    botMessage.edit(embedResult);

    for (let i = 0; i < result.tokenAmount; i++) {
        await MemberToken.add([message.author.id]).then(async () => {
            await Guild.eventChatChannel.send(`${message.author.username} a gagné un jeton !`);
        });
    }
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

        const randomEmojis = getRandomEmoji(5);
        const result = getDrawResult(randomEmojis);

        const embed = new Discord.MessageEmbed()
            .setColor('#ffb8e6')
            .setTitle(`${emojiLongFox}${emojiLuckyLeaf}[Lucky Fox]${emojiLuckyLeaf}${emojiLongFox}`)
            .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
            .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
            .setDescription(`Ok, Let's try something ...`)
            .setFooter(`${emojiLuckyLeaf} = JOKER`)
            .setTimestamp(new Date());

        message.channel.send(embed).then(botMessage => {
            displayEmojis(botMessage, message, result, randomEmojis);
        });
    }
}

module.exports = new LuckyFox();
