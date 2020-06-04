const DiscordJS = require('discord.js');
const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

const FILES = ['binla', 'whisky', 'whisky2'];

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['son'],
    category: CommandCategory.FUN,
    isAllowedForContext: CommandPermission.notInWelcome,
    process: async (message, args) => {
        const member = await Guild.getMemberFromMessage(message);
        const argsValid = args.length > 0;
        const voiceValid = member.voice.channel !== null;

        if (argsValid && voiceValid) {
            const file = args.join(' ');

            if (FILES.includes(file)) {
                const voiceChannelConnection = bot.voice.connections.find(connection => {
                    return connection.channel.guild.id === Guild.discordGuild.id
                        && connection.status === DiscordJS.Constants.VoiceStatus.CONNECTED
                });

                const play = (connection) => {
                    const streamDispatcher = connection.play(`./static/audio/${file}.mp3`);

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
                        message.reply(trans('model.command.sound.error'));
                    });
                }
            } else {
                message.reply(trans('model.command.sound.notFound'));
            }
        } else {
            message.reply(trans('model.command.sound.format'));
        }
    }
};
