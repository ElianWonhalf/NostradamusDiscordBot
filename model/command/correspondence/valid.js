const Logger = require('@lilywonhalf/pretty-logger');
const { MessageEmbed, MessageReaction } = require('discord.js');
const Config = require('../../../config.json');
const CommandPermission = require('../../command-permission');
const Guild = require('../../guild');
const Correspondence = require('../../correspondence');
const StatMessages = require('../../stat-messages');

const confirmEmoji = bot.emojis.cache.find(emoji => emoji.name === 'pollyes');
const cancelEmoji = bot.emojis.cache.find(emoji => emoji.name === 'pollno');

/**
 * @param {GuildMember} member
 * @param {TextChannel} destChannel
 * @param {string} toPost
 * @returns {function(MessageReaction)}
 */
const reactionHandler = (member, destChannel, toPost) => {
    return async (reaction) => {
        if (reaction.emoji.name === 'pollyes') {
            await member.roles.add(Config.roles.seekingCorrespondence);
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

/**
 * @param {Message} message
 * @param {Array} args
 */
module.exports = async (message, args) => {
    if (await CommandPermission.isMemberModOrSoft(message)) {
        if (args.length > 1) {
            const messageSnowflake = args.shift();

            await Guild.modDMsChannel.messages.fetch(messageSnowflake).then(async memberMessage => {
                const firstLine = args.join(' ').replace(/^(?:<@\d+> ?)?\(?(?<contents>[^)]+)\)?$/u, '$<contents>');
                const member = memberMessage.mentions.members.first();
                const retrievedContents = memberMessage.embeds[0].description.trim();

                if (Correspondence.isMemberEligible(member)) {
                    const toPost = `${member} (${firstLine})\n\n${retrievedContents}`;
                    const embed = new MessageEmbed().setDescription(toPost);
                    const destChannel = Guild.isMemberNative(member) || Guild.isMemberTutor(member)
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

                            reactionHandler(member, destChannel, toPost)(reaction);
                        }).catch(Logger.exception);
                } else {
                    message.reply(trans('model.command.correspondence.error.notEligible', [member.toString()], 'en'));
                }
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
    }
};
