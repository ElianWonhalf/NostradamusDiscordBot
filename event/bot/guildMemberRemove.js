const ModerationLog = require('../../model/moderation-log');
const Guild = require('../../model/guild');

/**
 * @param {GuildMember} member
 */
module.exports = async (member) => {
    if (isRightGuild(member.guild.id)) {
        member = await bot.users.fetch(member.id);

        Guild.stopMemberReactionCollectors(member.id);
        ModerationLog.processMemberRemove(member);
    }
};
