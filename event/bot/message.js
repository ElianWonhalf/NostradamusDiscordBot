const Logger = require('@elian-wonhalf/pretty-logger');
const Config = require('../../config.json');
const Hue = require('../../model/hue');
const Guild = require('../../model/guild');
const Blacklist = require('../../model/blacklist');
const MemberRolesFlow = require('../../model/member-roles-flow');
const Command = require('../../model/command');
const DM = require('../../model/dm');
const HardcoreLearning = require('../../model/hardcore-learning');
const SocialNetworkIntegration = require('../../model/social-network-integration');
const WatchedMember = require('../../model/watched-member');

/**
 * @param {Message} message
 */
module.exports = async (message) => {
    const user = message.author;

    SocialNetworkIntegration.handleMessage(message);
    WatchedMember.messageHandler(message);

    if (enableHue) {
        if (message.mentions.roles.size > 0 || message.mentions.users.has(Config.admin)) {
            Hue.flash(true);
        }
    }

    if (message.channel.id === Config.channels.roles) {
        setTimeout(() => {
            message.delete().catch(exception => Logger.error(exception.toString()));
        }, 60000);
    }

    if (!testMode && user.id !== Config.testAccount || testMode && (user.id === Config.testAccount || user.bot)) {
        Blacklist.parseMessage(message);

        if (message.channel.id !== Config.channels.welcome && !user.bot) {
            const isCommand = await Command.parseMessage(message);
            const watchedChannels = [Config.channels.beginner, Config.channels.learntLanguage];
            DM.parseMessage(message, isCommand);

            if (!isCommand && watchedChannels.indexOf(message.channel.id) > -1) {
                HardcoreLearning.addMessage(message);
            }
        }
    }
};
