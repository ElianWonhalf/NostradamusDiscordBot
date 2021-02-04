const Logger = require('@lilywonhalf/pretty-logger');
const { MessageEmbed } = require('discord.js');
const CommandPermission = require('../../command-permission');
const Guild = require('../../guild');

/**
 * @param {Message} message
 * @param {Array} args
 */
module.exports = async (message, args) => {
    if (!await CommandPermission.isMemberModOrSoft(message)) {
        return;
    }

    if (args.length < 1) {
        await message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollno'));
        await message.channel.send(trans('model.command.modLog.error.missingArgs', [], 'en'));
        return;
    }

    const messageSnowflake = args.shift();
    const reason = args.join(' ').replace(/https?:\/\/[^\s.]+\.[^\s]+/g, '[CENSORED LINK]');
    
    if (!reason) {
        await message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollno'));
        await message.channel.send(trans('model.command.modLog.error.missingReason', [], 'en'));
        return;
    }

    const memberMessage = await Guild.publicModLogChannel.messages.fetch(messageSnowflake).catch(Logger.exception);

    if (memberMessage === undefined) {
        await message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollno'));
        await message.channel.send(trans('model.command.modLog.error.messageNotFound', [], 'en'));
        return;
    }

    const embed = new MessageEmbed(memberMessage.embeds[0].toJSON());
    const firstPart = embed.description.trim().split(':')[0];

    embed.setDescription(`${firstPart}: ${reason}`);

    memberMessage.edit(embed).then(async () => {
        await message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollyes'));
    }).catch(async (error) => {
        Logger.error(error.toString());
        await message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollno'));
    });
};
