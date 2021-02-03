const Logger = require('@lilywonhalf/pretty-logger');
const Discord = require('discord.js');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

const emojiKwiziq = bot.emojis.cache.find(emoji => emoji.name === 'kwiziq');
const emojiDiscordNitro = bot.emojis.cache.find(emoji => emoji.name === 'nitro');
const emojiFoxAss = bot.emojis.cache.find(emoji => emoji.name === 'foxlong3');
const emojiFoxBody = bot.emojis.cache.find(emoji => emoji.name === 'foxlong2');
const emojiFoxHead = bot.emojis.cache.find(emoji => emoji.name === 'foxlong1');
const emojiLongFox = `${emojiFoxAss}${emojiFoxBody}${emojiFoxHead}`;
const emojiRight = '➡';
const emojiLeft = '⬅';
const emojiDown = '⬇';

let page = 0;
const arrayEmbeds = [];
const arrayEmojis = [];
arrayEmojis.push([emojiRight]);
arrayEmojis.push([emojiLeft]);

function getEmbed(message) {
    if (arrayEmbeds[page] !== undefined) {
        return arrayEmbeds[page];
    }

    let embed;

    switch (page) {
        case 0:
            embed = new Discord.MessageEmbed()
                .setColor('#ffb8e6')
                .setTitle(`${emojiLongFox}[Token help]${emojiLongFox}`)
                .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                .setDescription(`Every token is a chance to win a lifetime subscription to ${emojiKwiziq} Kwiziq or a ${emojiDiscordNitro} Discord Nitro subscriptions !`)
                .addField(`More info below ${emojiDown}`, `https://discord.com/channels/254463427949494292/597607738549338122/805119778511257641`)
                .addField(`Plus d'info ici ${emojiDown}`, `https://discord.com/channels/254463427949494292/597607738549338122/805115990525870150`)
                .setFooter(`React with ${emojiRight} for the command list`)
                .setTimestamp(new Date());
        break;
        case 1:
            embed = new Discord.MessageEmbed()
                .setColor('#ffb8e6')
                .setTitle(`${emojiLongFox}[Token command]${emojiLongFox}`)
                .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                .setDescription(`Here is a list of the commands for the event`)
                .addField(`.token-board`, `To see who has the most tokens`)
                .addField(`.token-info`, `To see how many tokens you have`)
                .addField(`.token-help`, `You are right in it`)
                .addField(`.xof-ykcul`, `? siht si tahw ...tiaW`)
                .setFooter(`React with ${emojiLeft} for more info`)
                .setTimestamp(new Date());
        break;
    }

    arrayEmbeds.push(embed);
    return embed;
}

const addReactToEmbed = (message, embededMsg) => {
    arrayEmojis[page].map(emoji => embededMsg.react(emoji));

    const reactFilter = (reaction, user) => user.id === message.author.id && arrayEmojis[page].includes(reaction.emoji.name);

    embededMsg.awaitReactions(reactFilter, { max: 1, maxEmojis: 1, time: 15000 }).then(collectedReactions => {
        if (!collectedReactions.first()) {
            embededMsg.reactions.removeAll();
        } else {
            checkReaction(collectedReactions.first()._emoji.name);
            embededMsg.reactions.removeAll().then(addReactToEmbed(message, embededMsg));

            const newEmbed = getEmbed(message);
            embededMsg.edit(newEmbed);
        }
    });
};

function checkReaction(emoji) {
    if (emoji) {
        switch (emoji) {
            case '➡':
                page++;
            break;
            case '⬅':
                page--;
            break;
        }
    }
}

class TokenHelp
{
    static instance = null;

    constructor() {
        if (TokenHelp.instance !== null) {
            return TokenHelp.instance;
        }

        this.aliases = [];
        this.category = CommandCategory.RESOURCE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        const helpEmbed = getEmbed(message);

        message.channel.send(helpEmbed).then(embededMsg => addReactToEmbed(message, embededMsg));
    }
}

module.exports = new TokenHelp();
