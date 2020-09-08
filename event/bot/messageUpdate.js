const Logger = require('@lilywonhalf/pretty-logger');
const Config = require('../../config.json');
const Blacklist = require('../../model/blacklist');
const Command = require('../../model/command');
const DM = require('../../model/dm');
const HardcoreLearning = require('../../model/hardcore-learning');
const Guild = require('../../model/guild');

/**
 * @param {Message} oldMessage
 * @param {Message} message
 */
module.exports = async (oldMessage, message) => {
    const user = message.author;

    if (oldMessage.content === message.content) {
        return;
    }

    if (message.guild === null || isRightGuild(message.guild.id)) {
        if (message.mentions.everyone) {
            Guild.everyonePingHandler(message);
        }

        if (message.mentions.roles.size > 0) {
            Guild.rolePingHandler(message);
        }

        if (message.guild !== null) {
            Blacklist.parseMessage(message);
        }

        if (message.channel.id !== Config.channels.welcome && !user.bot) {
            const isCommand = await Command.parseMessage(message);
            const watchedChannels = [Config.channels.beginner, Config.channels.learntLanguage];

            if (Config.channels.learntLanguageClone !== null) {
                watchedChannels.push(Config.channels.learntLanguageClone);
            }

            DM.parseMessage(message, isCommand, true);

            if (!isCommand && watchedChannels.indexOf(message.channel.id) > -1) {
                HardcoreLearning.addMessage(message);
            }
        }
    }
};
