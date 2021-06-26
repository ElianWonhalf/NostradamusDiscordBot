const DiscordJS = require('discord.js');
const Logger = require('@lilywonhalf/pretty-logger');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

const FILES = {
    'ah bin calisse': ['ahbincalisse'],
    'ahbincalisse': ['ahbincalisse'],
    'awwwh': ['awwwh', 'awwwh2'],
    'bonchour': ['bonchour'],
    'calisse': ['ahbincalisse'],
    'bin la': ['binla'],
    'binla': ['binla'],
    'damn': ['damn1', 'damn2', 'damn3', 'damn4', 'damn5', 'damn6', 'damn7', 'damn8', 'damn9', 'damn10', 'damn11', 'damn12', 'damn13'],
    'honey': ['honey1', 'honey2', 'honey3', 'honey4'],
    'gah': ['gah'],
    'pute': ['pute'],
    'rru': ['rru'],
    'whisky': ['whisky1', 'whisky2', 'whisky3', 'whisky4', 'whisky5']
};

class Sound
{
    static instance = null;

    constructor() {
        if (Sound.instance !== null) {
            return Sound.instance;
        }

        this.aliases = ['son'];
        this.category = CommandCategory.FUN;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        const member = await Guild.getMemberFromMessage(message);
        const argsValid = args.length > 0;
        const voiceValid = member.voice.channel !== null;

        if (argsValid && voiceValid) {
            const file = args.join(' ');

            if (FILES.hasOwnProperty(file)) {
                const voiceChannelConnection = bot.voice.connections.find(connection => {
                    return connection.channel.guild.id === Guild.discordGuild.id
                        && connection.status === DiscordJS.Constants.VoiceStatus.CONNECTED
                });

                const play = (connection) => {
                    const streamDispatcher = connection.play(`./static/audio/${getRandomArrayElement(FILES[file])}.mp3`);

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
}

module.exports = new Sound();
