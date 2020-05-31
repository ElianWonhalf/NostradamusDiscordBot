const StatProfileChange = require('../../model/stat-profile-change');

/**
 * @param {GuildMember} oldMember
 * @param {GuildMember} newMember
 */
module.exports = (oldMember, newMember) => {
    if (oldMember.nickname !== newMember.nickname && newMember.nickname !== null && newMember.nickname !== undefined) {
        StatProfileChange.save(
            newMember.id,
            newMember.nickname,
            { type: StatProfileChange.constructor.TYPE_NICKNAME }
        );
    }
};
