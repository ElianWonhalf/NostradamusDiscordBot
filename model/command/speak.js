const DiscordJS = require('discord.js');
const Logger = require('@lilywonhalf/pretty-logger');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const VoiceSynthesizer = require('../voice-synthesizer');
const CommandPermission = require('../command-permission');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: [],
    category: CommandCategory.FUN,
    isAllowedForContext: CommandPermission.isMemberModOrTutor,
    process: async (message, args) => {
        const member = await Guild.getMemberFromMessage(message);
        const argsValid = args.length > 1 && args[0].length === 2;
        const voiceValid = member.voice.channel !== null;

        if (argsValid && voiceValid) {
            const language = args.shift();
            const text = args.join(' ');

            const voiceChannelConnection = bot.voice.connections.find(connection => {
                return connection.channel.guild.id === Guild.discordGuild.id
                    && connection.status === DiscordJS.Constants.VoiceStatus.CONNECTED
            });

            VoiceSynthesizer.synthesize(language, text).then(audioFilePath => {
                const speak = (connection) => {
                    const streamDispatcher = connection.play(audioFilePath);

                    streamDispatcher.on('finish', () => {
                        setTimeout(() => {
                            connection.channel.leave();
                        }, 1000);
                    });
                };

                if (voiceChannelConnection !== undefined && voiceChannelConnection.channel.id === member.voice.channel.id) {
                    speak(voiceChannelConnection);
                } else {
                    member.voice.channel.join().then(speak).catch(exception => {
                        Logger.exception(exception);
                        message.reply(trans('model.command.speak.error'));
                    });
                }
            }).catch(() => {
                message.reply(trans('model.command.speak.error'));
            });
        } else {
            message.reply(trans('model.command.speak.format'));
        }
    }
};
