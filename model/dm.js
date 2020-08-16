const Logger = require('@lilywonhalf/pretty-logger');
const Discord = require('discord.js');
const Config = require('../config.json');
const Guild = require('./guild');

const GREETINGS = [
    'bonjour',
    'bonsoir',
    'bon matin',
    'bon soir',
    'bon après-midi',
    'bonne après-midi',
    'bon après midi',
    'bonne après midi',
    'bon apres-midi',
    'bonne apres-midi',
    'bon apres midi',
    'bonne apres midi',
    'bon aprèsmidi',
    'bonne aprèsmidi',
    'bon aprèsmidi',
    'bonne aprèsmidi',
    'bon apresmidi',
    'bonne apresmidi',
    'bon apresmidi',
    'bonne apresmidi',
    'salut',
    'salutations',
    'hello',
    'hi',
    'good morning',
    'good afternoon',
    'good evening',
    'good night'
];

const DM = {
    ignoredUserDMs: [],

    init: () => {
        Guild.events.on('member.ignoreDMStart', (member) => {
            if (!DM.ignoredUserDMs.includes(member.user.id)) {
                DM.ignoredUserDMs.push(member.user.id);
            }
        });

        Guild.events.on('member.ignoreDMEnd', (member) => {
            const idx = DM.ignoredUserDMs.findIndex(id => id === member.user.id);
            if (idx >= 0) DM.ignoredUserDMs.splice(idx, 1);
        });
    },

    /**
     * @param {Message} message
     * @param {boolean} isCommand
     */
    parseMessage: async (message, isCommand) => {
        if (message.guild === null && !isCommand && !DM.ignoredUserDMs.includes(message.author.id)) {
            const embed = await Guild.messageToEmbed(message);

            embed.setFooter(`${Config.prefix}dmreply ${message.author.id}`);

            Guild.modDMsChannel.send(
                trans('model.dm.notification', [message.author], 'en'),
                {
                    embed: embed,
                    files: message.attachments.map(messageAttachment => {
                        return new Discord.MessageAttachment(messageAttachment.url, messageAttachment.filename);
                    })
                }
            ).then((sentMessage) => {
                const emoji = bot.emojis.cache.find(emoji => emoji.name === 'pollyes');
                message.react(emoji);

                if (GREETINGS.includes(message.content.toLowerCase())) {
                    message.channel.send(trans('model.dm.greetingsAnswer'));
                    Guild.modDMsChannel.send(trans('model.dm.greetingsAnswerSent', [], 'en'));
                }

                sentMessage.react('📋');
            }).catch((exception) => {
                const emoji = bot.emojis.cache.find(emoji => emoji.name === 'pollno');

                message.react(emoji);
                Logger.exception(exception);
            });
        }
    },

    /**
     * @param {MessageReaction} reaction
     * @param {User} user
     */
    handleReaction: (reaction, user) => {
        const message = reaction.message;
        const isRightReaction = user.id !== bot.user.id && reaction.emoji.name === '📋';
        const isInDMs = message.channel.id === Config.channels.modDMs;
        const isByMe = message.author.id === bot.user.id;
        const hasEmbeds = message.embeds.length > 0 && typeof message.embeds[0].description !== 'undefined';

        if (isRightReaction && isInDMs && isByMe && hasEmbeds) {
            Guild.modDMsChannel.send(`\`\`\`${message.embeds[0].description}\`\`\``);
        }
    }
};

module.exports = DM;
