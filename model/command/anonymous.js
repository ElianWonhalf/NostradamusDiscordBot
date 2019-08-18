const Logger = require('@elian-wonhalf/pretty-logger');
const Discord = require('discord.js');
const Config = require('../../config.json');
const EmojiCharacters = require('../../emoji-characters.json');
const Guild = require('../guild');
const EventsBus = require('../events-bus');

let member = null;
let channel = null;

const FRENCH = 'fr';
const ENGLISH = 'en';
let language = null;

const ADMIN = 'admin';
const MOD = 'mod';
let recipient = null;

const fourthStep = async (collection) => {
    let message = null;

    if (collection.size > 0) {
        message = collection.first();
    }

    if (message === null) {
        channel.send(trans('model.command.anonymous.fourthStepNoMessage', [Config.prefix], language));
        EventsBus.dispatch('member.ignoreDMEnd', member);
    } else {
        let recipientChannel = Guild.anonymousMessagesChannel;

        if (recipient === ADMIN) {
            recipientChannel = await bot.users.get(Config.admin).createDM();
        }

        recipientChannel.send(
            trans('model.command.anonymous.anonymousMessageWrapper', [message.content], 'en'),
            {
                files: message.attachments.map(messageAttachment => {
                    return new Discord.Attachment(messageAttachment.url, messageAttachment.filename);
                })
            }
        ).then(() => {
            channel.send(trans('model.command.anonymous.fourthStepSuccess', [], language));
            EventsBus.dispatch('member.ignoreDMEnd', member);
        }).catch((exception) => {
            Logger.exception(exception);
            Guild.botChannel.send(trans('model.command.anonymous.fourthStepErrorNotice', [], 'en'));
            channel.send(trans('model.command.anonymous.fourthStepErrorAnswer', [], language));
            EventsBus.dispatch('member.ignoreDMEnd', member);
        });
    }
};

const thirdStep = async (collection) => {
    if (collection.size < 1) {
        EventsBus.dispatch('member.ignoreDMEnd', member);
        return;
    }

    recipient = collection.first().emoji.name === EmojiCharacters[1] ? ADMIN : MOD;

    const filter = (message) => {
        return message.author.id === member.user.id;
    };

    await channel.send(trans('model.command.anonymous.thirdStep', [], language));

    // 30 minutes
    channel.awaitMessages(filter, { time: 1800000, max: 1 }).then(fourthStep).catch(Logger.exception);
};

const secondStep = async (collection) => {
    if (collection.size < 1) {
        EventsBus.dispatch('member.ignoreDMEnd', member);
        return;
    }

    language = collection.first().emoji.name === EmojiCharacters[1] ? ENGLISH : FRENCH;

    const filter = (reaction, user) => {
        const emoji = reaction.emoji.name;
        return (emoji === EmojiCharacters[1] || emoji === EmojiCharacters[2]) && user.id === member.user.id;
    };

    const secondStepMessage = await channel.send(trans('model.command.anonymous.secondStep', [], language));

    // 5 minutes
    secondStepMessage.awaitReactions(filter, { time: 300000, max: 1 }).then(thirdStep).catch(Logger.exception);

    await secondStepMessage.react(EmojiCharacters[1]);
    await secondStepMessage.react(EmojiCharacters[2]);
};

/**
 * @param {Message} message
 */
module.exports = async (message) => {
    member = Guild.getMemberFromMessage(message);
    channel = message.channel;

    if (message.guild !== null) {
        message.reply(`\n${trans('model.command.anonymous.publicWarn')}`);
    } else {
        EventsBus.dispatch('member.ignoreDMStart', member);

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
    }
};
