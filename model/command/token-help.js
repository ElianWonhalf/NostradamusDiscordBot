const { MessageEmbed } = require('discord.js');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');
const Guild = require('../guild');

const emojiKwiziq = bot.emojis.cache.find(emoji => emoji.name === 'kwiziq');
const emojiDiscordNitro = bot.emojis.cache.find(emoji => emoji.name === 'nitro');
const emojiFoxBottom = bot.emojis.cache.find(emoji => emoji.name === 'foxlong3');
const emojiFoxBody = bot.emojis.cache.find(emoji => emoji.name === 'foxlong2');
const emojiFoxHead = bot.emojis.cache.find(emoji => emoji.name === 'foxlong1');
const emojiLongFox = `${emojiFoxBottom}${emojiFoxBody}${emojiFoxHead}`;
const emojiRight = '➡';
const emojiLeft = '⬅';
const emojiDown = '⬇';

let page = 0;
const arrayEmbeds = [];
const arrayEmojis = [];
arrayEmojis.push([emojiRight]);
arrayEmojis.push([emojiLeft]);

/**
 *
 * @param {Message} message
 *
 * @return {MessageEmbed}
 */
function getEmbed(message) {
    if (arrayEmbeds[page] !== undefined) {
        return arrayEmbeds[page];
    }

    let embed;

    switch (page) {
        case 0:
            embed = new MessageEmbed()
                .setColor('#ffb8e6')
                .setTitle(`${emojiLongFox}[Token help]${emojiLongFox}`)
                .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                .setDescription(trans('model.command.tokenHelp.reward', [emojiKwiziq, emojiDiscordNitro]))
                .addField(trans('model.command.tokenHelp.moreInfo.infoBelow', [emojiDown]), 'https://discord.com/channels/254463427949494292/597607738549338122/805119778511257641')
                .addField(trans('model.command.tokenHelp.moreInfo.infoBelowFrench', [emojiDown]), 'https://discord.com/channels/254463427949494292/597607738549338122/805115990525870150')
                .addField(`Looking for the command list ?`, trans('model.command.tokenHelp.moreInfo.reactRight', [emojiRight]))
                .addField(trans('model.command.tokenHelp.gameOfTheDay'), `➡${Guild.eventAnnouncementsChannel.toString()}⬅`)
                .setTimestamp(new Date());
        break;

        case 1:
            embed = new MessageEmbed()
                .setColor('#ffb8e6')
                .setTitle(`${emojiLongFox}[Token commands]${emojiLongFox}`)
                .setAuthor(message.author.username, message.author.displayAvatarURL({ dynamic: true }))
                .setThumbnail(message.author.displayAvatarURL({ dynamic: true }))
                .setDescription((trans('model.command.tokenHelp.commandList')))
                .addField('.token-board', (trans('model.command.tokenHelp.commands.tokenBoard')))
                .addField('.token-info', (trans('model.command.tokenHelp.commands.tokenInfo')))
                .addField('.token-help', (trans('model.command.tokenHelp.commands.tokenHelp')))
                .addField('.xof-ykcul', (trans('model.command.tokenHelp.commands.xofYkcul')))
                .addField(trans('model.command.tokenHelp.moreInfo.forMoreInfo'), trans('model.command.tokenHelp.moreInfo.reactLeft', [emojiLeft]))
                .addField(trans('model.command.tokenHelp.gameOfTheDay')), `➡${Guild.eventAnnouncementsChannel.toString()}⬅`)
                .setTimestamp(new Date());
        break;
    }

    arrayEmbeds.push(embed);

    return embed;
}

/**
 *
 * @param {Message} message
 * @param {Message} embededMsg
 */
const addReactToEmbed = (message, embededMsg) => {
    arrayEmojis[page].map(emoji => embededMsg.react(emoji));

    const reactFilter = (reaction, user) => user.id === message.author.id && arrayEmojis[page].includes(reaction.emoji.name);

    embededMsg.awaitReactions(reactFilter, { max: 1, maxEmojis: 1, time: 15000 }).then(async collectedReactions => {
        if (!collectedReactions.first()) {
            embededMsg.reactions.removeAll();
        } else {
            checkReaction(collectedReactions.first().emoji.name);

            await embededMsg.reactions.removeAll().then(() => {
                addReactToEmbed(message, embededMsg)
            });

            const newEmbed = getEmbed(message);

            embededMsg.edit(newEmbed);
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
        this.category = CommandCategory.FUN;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        const helpEmbed = getEmbed(message);

        message.channel.send(helpEmbed).then(embeddedMessage => addReactToEmbed(message, embeddedMessage));
    }
}

module.exports = new TokenHelp();
