const Logger = require('@lilywonhalf/pretty-logger');
const Config = require('../../config.json');
const Blacklist = require('../../model/blacklist');
const Command = require('../../model/command');
const DM = require('../../model/dm');
const HardcoreLearning = require('../../model/hardcore-learning');
const SocialNetworkIntegration = require('../../model/social-network-integration');
const WatchedMember = require('../../model/watched-member');
const StatMessages = require('../../model/stat-messages');

/**
 * @param {Message} message
 */
module.exports = async (message) => {
    const user = message.author;

    if (message.guild === null || isRightGuild(message.guild.id)) {
        WatchedMember.messageHandler(message);

        // Delete messages in the #rôles channel after one minute
        if (message.channel.id === Config.channels.roles) {
            setTimeout(() => {
                message.delete().catch(exception => Logger.error(exception.toString()));
            }, 60000);
        }

        if (message.guild !== null) {
            SocialNetworkIntegration.handleMessage(message);
            Blacklist.parseMessage(message);

            StatMessages.save(message.author.id, '+1');
        }

        if (message.channel.id !== Config.channels.welcome && !user.bot) {
            const isCommand = await Command.parseMessage(message);
            const watchedChannels = [Config.channels.beginner, Config.channels.learntLanguage];

            if (Config.channels.learntLanguageClone !== null) {
                watchedChannels.push(Config.channels.learntLanguageClone);
            }

            DM.parseMessage(message, isCommand);

            if (!isCommand && watchedChannels.indexOf(message.channel.id) > -1) {
                HardcoreLearning.addMessage(message);
            }
        }
    }
};
