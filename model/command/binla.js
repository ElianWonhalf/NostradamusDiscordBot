const DiscordJS = require('discord.js');
const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['bin-la', 'bin-là', 'binlà'],
    category: CommandCategory.FUN,
    isAllowedForContext: CommandPermission.notInWelcome,
    process: async (message) => {
        const member = await Guild.getMemberFromMessage(message);
        const voiceValid = member.voice.channel !== null;

        if (voiceValid) {
            const voiceChannelConnection = bot.voice.connections.find(connection => {
                return connection.channel.guild.id === Guild.discordGuild.id
                    && connection.status === DiscordJS.Constants.VoiceStatus.CONNECTED
            });

            const play = (connection) => {
                const streamDispatcher = connection.play('./static/audio/binla.mp3');

                streamDispatcher.on('finish', () => {
                    setTimeout(() => {
                        connection.channel.leave();
                    }, 1000);
                });
            };

            if (voiceChannelConnection !== undefined && voiceChannelConnection.channel.id === member.voice.channel.id) {
                play(voiceChannelConnection);
            } else {
                member.voice.channel.join().then(play).catch(exception => {
                    Logger.exception(exception);
                    message.reply(trans('model.command.binla.error'));
                });
            }
        } else {
            message.reply(trans('model.command.binla.format'));
        }
    }
};
