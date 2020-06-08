const StatProfileChange = require('../../model/stat-profile-change');

/**
 * @param {GuildMember} oldMember
 * @param {GuildMember} newMember
 */
module.exports = (oldMember, newMember) => {
    const hasNickname = newMember.nickname !== null && newMember.nickname !== undefined;

    if (isRightGuild(oldMember.guild.id) && oldMember.nickname !== newMember.nickname && hasNickname) {
        StatProfileChange.save(
            newMember.id,
            newMember.nickname,
            {type: StatProfileChange.constructor.TYPE_NICKNAME}
        );
    }
};
