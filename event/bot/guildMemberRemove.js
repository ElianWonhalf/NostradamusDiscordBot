const Config = require('../../config.json');
const Guild = require('../../model/guild');
const ModerationLog = require('../../model/moderation-log');

/**
 * @param {GuildMember} member
 */
module.exports = async (member) => {
    if (!testMode && member.user.id !== Config.testAccount || testMode && member.user.id === Config.testAccount) {
        Guild.clearWelcomeMessagesForMember(member);
        ModerationLog.processMemberRemove(member);
    }
};
