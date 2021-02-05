const Logger = require('@lilywonhalf/pretty-logger');
const { MessageEmbed, MessageReaction } = require('discord.js');
const CommandPermission = require('../../command-permission');
const Guild = require('../../guild');
const ModerationLog = require('../../moderation-log');

/**
 * @param {Message} message
 * @param {Array} args
 */
module.exports = async (message, args) => {
    if (!await CommandPermission.isMemberModOrSoft(message)) {
        return;
    }

    if (args.length < 2) {
        await message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollno'));
        await message.channel.send(trans('model.command.modLog.error.missingArgs', [], 'en'));
        return;
    }

    const searchResult = Guild.findDesignatedMemberInMessage(message);

    if (!searchResult.certain || searchResult.foundMembers.length < 1) {
        await message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollno'));
        await message.channel.send(trans('model.command.modLog.error.memberNotFound', [], 'en'));
        return;
    }

    const action = args.shift();
    args.shift();
    const reason = args.join(' ').replace(/https?:\/\/[^\s.]+\.[^\s]+/g, '[CENSORED LINK]');
    
    if (!reason) {
        await message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollno'));
        await message.channel.send(trans('model.command.modLog.error.missingReason', [], 'en'));
        return;
    }

    const actionData = {
        ban: {
            colour: 0xFF0000, // red
            translationKey: 'model.moderationLog.banned'
        },
        kick: {
            colour: 0xFC8403, // orange
            translationKey: 'model.moderationLog.kicked'
        },
        unban: {
            colour: 0x00FF00, // green
            translationKey: 'model.moderationLog.unbanned'
        }
    };

    const definedAction = actionData[action];
    if (definedAction === undefined) {
        await message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollno'));
        await message.channel.send(trans('model.command.modLog.error.missingAction', [], 'en'));
        return;
    }

    const user = searchResult.foundMembers[0].user ?? searchResult.foundMembers[0];

    const embed = new MessageEmbed().setAuthor(
        `${user.username}#${user.discriminator}`,
        user.displayAvatarURL({ dynamic: true })
    );

    const userText = trans('model.moderationLog.member', [user.toString()], ModerationLog.language);
    const actionText = trans((definedAction.translationKey), [], ModerationLog.language);

    const reasonText = trans('model.moderationLog.reason', [reason], ModerationLog.language);

    embed.setColor(definedAction.colour);
    embed.setDescription(`${userText} ${actionText} ${reasonText}`);

    await Guild.publicModLogChannel.send(embed).then(async () => {
        await message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollyes'));
    }).catch(async (error) => {
        Logger.error(error.toString());
        await message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollno'));
    });
};
