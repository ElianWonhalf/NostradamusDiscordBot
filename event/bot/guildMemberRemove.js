const Config = require('../../config.json');
const ModerationLog = require('../../model/moderation-log');
const Guild = require('../../model/guild');

/**
 * @param {GuildMember} member
 */
module.exports = async (member) => {
    if (!testMode && member.user.id !== Config.testAccount || testMode && member.user.id === Config.testAccount) {
        member = await bot.users.fetch(member.id);

        Guild.stopMemberReactionCollectors(member.id);
        ModerationLog.processMemberRemove(member);
    }
};
