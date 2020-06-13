const Logger = require('@lilywonhalf/pretty-logger');
const Discord = require('discord.js');
const Config = require('../../config.json');
const EmojiCharacters = require('../../emoji-characters.json');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

let member = null;
let channel = null;

const FRENCH = 'fr';
const ENGLISH = 'en';
let language = null;

const THIRTY_MINUTES = 1800000;

/**
 * @param {string} string
 * @returns {string}
 */
const escapeRegex = (string) => {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

/**
 * @param {Message} message
 */
const thirdStep = async (message) => {
    const commandSearch = new RegExp(`^${escapeRegex(Config.prefix)}anonymous`, 'u');
    const content = message.content.replace(commandSearch, '').trim();
    const sendAnonymousMessage = () => {
        Guild.anonymousMessagesChannel.send(
            content,
            {
                files: message.attachments.map(messageAttachment => {
                    return new Discord.MessageAttachment(messageAttachment.url, messageAttachment.filename);
                })
            }
        ).then(() => {
            channel.send(trans('model.command.anonymous.thirdStepSuccess', [], language));
            Guild.events.emit('member.ignoreDMEnd', member);
            language = null;
        }).catch((exception) => {
            Logger.exception(exception);
            Guild.botChannel.send(trans('model.command.anonymous.thirdStepErrorNotice', [], 'en'));
            channel.send(trans('model.command.anonymous.thirdStepErrorAnswer', [], language));
            Guild.events.emit('member.ignoreDMEnd', member);
            language = null;
        });
    };

    Guild.anonymousMessagesChannel.send(
        trans('model.command.anonymous.anonymousMessageWrapper', [], 'en')
    ).then(sendAnonymousMessage).catch(sendAnonymousMessage);
};

/**
 * @param {Collection<Snowflake, MessageReaction>} collection
 */
const secondStep = async (collection) => {
    if (collection.size < 1) {
        Guild.events.emit('member.ignoreDMEnd', member);
        language = null;

        return;
    }

    language = collection.first().emoji.name === EmojiCharacters[1] ? ENGLISH : FRENCH;

    const filter = (message) => {
        return message.author.id === member.user.id;
    };

    await channel.send(trans('model.command.anonymous.secondStep', [], language));

    /**
     * @param {Collection<Snowflake, MessageReaction>} collection
     */
    channel.awaitMessages(filter, { time: THIRTY_MINUTES, max: 1 }).then((collection) => {
        let message = null;

        if (collection.size > 0) {
            message = collection.first();
        }

        if (message === null) {
            channel.send(trans('model.command.anonymous.thirdStepNoMessage', [Config.prefix], language));
            Guild.events.emit('member.ignoreDMEnd', member);
            language = null;
        } else {
            thirdStep(message);
        }
    }).catch((error) => {
        Logger.exception(error);
        language = null;
    });
};

/**
 * @param {Message} message
 */
module.exports = {
    aliases: [],
    category: CommandCategory.MODERATION,
    isAllowedForContext: CommandPermission.notInWelcome,
    process: async (message, args) => {
        member = await Guild.getMemberFromMessage(message);
        channel = message.channel;

        if (message.guild !== null) {
            message.reply(trans('model.command.anonymous.publicWarn'));
        } else {
            Guild.events.emit('member.ignoreDMStart', member);

            if (args.length < 1) {
                const filter = (reaction, user) => {
                    const emoji = reaction.emoji.name;
                    return (emoji === EmojiCharacters[1] || emoji === EmojiCharacters[2]) && user.id === member.user.id;
                };

                /** {Message} firstStepMessage */
                const firstStepMessage = await channel.send(trans('model.command.anonymous.firstStep'));

                // 5 minutes
                firstStepMessage.awaitReactions(filter, { time: 300000, max: 1 }).then(secondStep).catch(Logger.exception);

                await firstStepMessage.react(EmojiCharacters[1]);
                await firstStepMessage.react(EmojiCharacters[2]);
            } else {
                await thirdStep(message);
            }
        }
    }
};
