const ModerationLog = require('../../model/moderation-log');
const Guild = require('../../model/guild');
const WatchedMember = require('../../model/watched-member');
const StatMemberFlow = require('../../model/stat-member-flow');

/**
 * @param {GuildMember} member
 */
module.exports = async (member) => {
    if (isRightGuild(member.guild.id)) {
        const user = await bot.users.fetch(member.id);

        WatchedMember.guildMemberRemoveHandler(member);
        StatMemberFlow.save(member.id, StatMemberFlow.constructor.MEMBER_FLOW_EVENT_LEFT);
        Guild.stopMemberReactionCollectors(member.id);
        ModerationLog.processMemberRemove(user);
    }
};
