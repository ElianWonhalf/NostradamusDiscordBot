const Config = require('../../config.json');
const ModerationLog = require('../../model/moderation-log');

/**
 * @param {GuildMember} member
 */
module.exports = async (member) => {
    if (!testMode && member.user.id !== Config.testAccount || testMode && member.user.id === Config.testAccount) {
        ModerationLog.processMemberRemove(member);
    }
};
