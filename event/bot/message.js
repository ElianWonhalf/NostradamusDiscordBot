const Logger = require('@elian-wonhalf/pretty-logger');
const Config = require('../../config.json');
const Hue = require('../../model/hue');
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

    SocialNetworkIntegration.handleMessage(message);
    WatchedMember.messageHandler(message);

    if (enableHue && message.author.id !== Config.admin) {
        if (message.mentions.roles.size > 0 || message.mentions.users.has(Config.admin)) {
            Hue.flash(true);
        } else {
            let found = false;
            const mom = await bot.users.fetch(Config.admin);
            const username = mom.username;
            const searching = [
                Config.admin,
                username,
                'liily'
            ].concat(username.split(' ')).map(value => value.toLowerCase());

            searching.forEach(search => {
                found = found || message.content.toLowerCase().indexOf(search) > -1;
            });

            if (found) {
                Hue.flash(true);
            }
        }
    }

    if (message.channel.id === Config.channels.roles) {
        setTimeout(() => {
            message.delete().catch(exception => Logger.error(exception.toString()));
        }, 60000);
    }

    if (!testMode && user.id !== Config.testAccount || testMode && (user.id === Config.testAccount || user.bot)) {
        Blacklist.parseMessage(message);

        if (message.guild !== null) {
            StatMessages.save(message.author.id, '+1');
        }

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
