const DiscordJS = require('discord.js');
const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const VoiceSynthesizer = require('../voice-synthesizer');
let disconnectTimeout = null;

/**
 * @param {Message} message
 */
module.exports = {
    aliases: [],
    category: CommandCategory.FUN,
    process: async (message, args) => {
        const member = await Guild.getMemberFromMessage(message);
        const argsValid = args.length > 1 && args[0].length === 2;
        const voiceValid = member.voiceChannel !== null;

        if (Guild.isMemberMod(member)) {
            if (argsValid && voiceValid) {
                const language = args.shift();
                const text = args.join(' ');

                const voiceChannelConnection = bot.voiceConnections.find(connection => {
                    return connection.channel.guild.id === Guild.discordGuild.id
                        && connection.status === DiscordJS.Constants.VoiceStatus.CONNECTED
                });

                VoiceSynthesizer.synthesize(language, text).then(audioFilePath => {
                    const speak = (connection) => {
                        const streamDispatcher = connection.playFile(audioFilePath);

                        if (disconnectTimeout !== null) {
                            clearTimeout(disconnectTimeout);
                        }

                        streamDispatcher.on('end', () => {
                            disconnectTimeout = setTimeout(() => {
                                connection.disconnect();
                            }, 10000);
                        });
                    };

                    if (voiceChannelConnection !== null && voiceChannelConnection.channel.id === member.voiceChannelID) {
                        speak(voiceChannelConnection);
                    } else {
                        member.voiceChannel.join().then(speak).catch(exception => {
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
    }
};
