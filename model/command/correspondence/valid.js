const Logger = require('@lilywonhalf/pretty-logger');
const { MessageEmbed, MessageReaction } = require('discord.js');
const Guild = require('../../guild');
const StatMessages = require('../../stat-messages');
const StatMemberFlow = require('../../stat-member-flow');

const confirmEmoji = bot.emojis.cache.find(emoji => emoji.name === 'pollyes');
const cancelEmoji = bot.emojis.cache.find(emoji => emoji.name === 'pollno');

/**
 * @param {GuildMember} member
 * @returns {Promise.<string>}
 * TODO override GuildMember class to add this
 */
const getMemberJoinedDate = async (member) => {
    const firstMessageDate = await StatMessages.getFirstMessageDate(member.id);
    const savedJoinDate = await StatMemberFlow.getFirstJoinedDate(member.id);
    let joinDate = member.user ? member.joinedAt : null;
    let prefix = '';

    if (firstMessageDate !== undefined && (joinDate === null || firstMessageDate.getTime() < joinDate.getTime())) {
        joinDate = firstMessageDate;
        prefix = '≈';
    }

    let joinDateWithoutTime = null;

    if (joinDate !== null) {
        joinDateWithoutTime = new Date(joinDate.getTime());
        joinDateWithoutTime.setHours(0);
        joinDateWithoutTime.setMinutes(0);
        joinDateWithoutTime.setSeconds(0);
        joinDateWithoutTime.setMilliseconds(0);
    }

    if (savedJoinDate !== null && (joinDateWithoutTime === null || savedJoinDate.getTime() < joinDateWithoutTime.getTime())) {
        joinDate = savedJoinDate;
    }

    if (joinDate !== null) {
        const elapsedTime = (new Date().getTime() - joinDate.getTime()) / 1000;
        const elapsedTimeString = secondsAmountToDelayString(elapsedTime, 'day');

        return `${prefix}${joinDate.toLocaleString('fr', DATE_FORMAT_OPTIONS).replace(' à 00:00:00', '')} (${elapsedTimeString})`;
    } else {
        return `--`;
    }
};

/**
 * @param {Message} message
 * @param {TextChannel} destChannel
 * @param {string} toPost
 * @returns {function(MessageReaction)}
 */
const reactionHandler = (message, destChannel, toPost) => {
    return async (reaction) => {
        if (reaction.emoji.name === 'pollyes') {
            await destChannel.send(toPost);
            await reaction.message.reactions.removeAll();
            reaction.message.edit(
                trans('model.command.correspondence.valid.success', [destChannel.toString()], 'en'),
                {
                    embed: reaction.message.embeds[0].setColor(0x00FF00)
                }
            );
        } else {
            await reaction.message.reactions.removeAll();
            reaction.message.edit(
                trans('model.command.correspondence.valid.cancelled', [], 'en'),
                {
                    embed: reaction.message.embeds[0].setColor(0xFF0000)
                }
            );
        }
    };
};

const postMemberStats = async (message, member) => {
    const messagesAmount = await StatMessages.getAmount(member.id);
    const firstJoinDate = await getMemberJoinedDate(member);

    return message.channel.send(
        trans(
            'model.command.correspondence.valid.memberStats',
            [member.toString(), messagesAmount, firstJoinDate],
            'en'
        )
    );
};

/**
 * @param {Message} message
 * @param {Array} args
 * @returns {Promise.<void>}
 */
module.exports = async (message, args) => {
    if (args.length > 1) {
        const messageSnowflake = args.shift();

        await Guild.modDMsChannel.messages.fetch(messageSnowflake).then(async memberMessage => {
            const firstLine = args.join(' ').replace(/^(?:<@\d+> ?)?\(?(?<contents>[^)]+)\)?$/u, '$<contents>');
            const member = memberMessage.mentions.members.first();
            const retrievedContents = memberMessage.embeds[0].description.trim();

            await postMemberStats(message, member);

            const toPost = `${member} (${firstLine})\n\n${retrievedContents}`;
            const embed = new MessageEmbed().setDescription(toPost);
            const destChannel = Guild.isMemberNative(member)
                ? Guild.correspondenceNativesChannel
                : Guild.correspondenceLearnersChannel;

            const filter = (reaction, user) => {
                return ['pollyes', 'pollno'].includes(reaction.emoji.name) && user.id === message.author.id;
            };

            const confirmMessage = await message.reply(
                trans('model.command.correspondence.valid.confirm', [destChannel.toString()], 'en'),
                {embed}
            );
            await confirmMessage.react(confirmEmoji);
            await confirmMessage.react(cancelEmoji);

            // 5 minutes
            confirmMessage.awaitReactions(filter, { time: 5 * MINUTE, max: 1 })
                .then(collected => {
                    const data = {me: true, count: 2, emoji: cancelEmoji};
                    let reaction = new MessageReaction(bot, data, confirmMessage);

                    if (collected.size > 0) {
                        reaction = collected.first();
                    }

                    reactionHandler(message, destChannel, toPost)(reaction);
                }).catch(Logger.exception);
        }).catch(error => {
            Logger.exception(error);
            message.react(cancelEmoji);
        });
    } else {
        message.reply(trans(
            'model.command.correspondence.error.notEnoughArgs',
            ['message ID, first line of post'],
            'en'
        ));
    }
};
