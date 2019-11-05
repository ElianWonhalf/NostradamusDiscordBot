const Logger = require('@elian-wonhalf/pretty-logger');
const Config = require('../../config.json');
const Guild = require('../../model/guild');
const Blacklist = require('../../model/blacklist');
const MemberRolesFlow = require('../../model/member-roles-flow');
const Command = require('../../model/command');
const DM = require('../../model/dm');
const HardcoreLearning = require('../../model/hardcore-learning');

/**
 * @param {Message} message
 */
module.exports = async (message) => {
    const user = message.author;

    if (message.channel.id === Config.channels.roles) {
        setTimeout(() => {
            message.delete().catch(exception => Logger.error(exception.toString()));
        }, 60000);
    }

    if (!testMode && user.id !== Config.testAccount || testMode && (user.id === Config.testAccount || user.bot)) {
        Blacklist.parseMessage(message);

        if (message.channel.id === Config.channels.welcome) {
            const member = await Guild.discordGuild.fetchMember(user, false);

            Guild.addMessageFromWelcomeToMap(message);
            if (!user.bot && !member.roles.has(Config.roles.officialMember)) {
                MemberRolesFlow.parse(message);
            }
        } else if (!user.bot) {
            const isCommand = await Command.parseMessage(message);
            const watchedChannels = [Config.channels.beginner, Config.channels.learntLanguage];
            DM.parseMessage(message, isCommand);

            if (!isCommand && watchedChannels.indexOf(message.channel.id) > -1) {
                HardcoreLearning.addMessage(message);
            }
        }
    }
};
