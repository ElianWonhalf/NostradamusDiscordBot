const ModerationLog = require('../../model/moderation-log');

/**
 * @param {Guild} guild
 * @param {User} user
 */
module.exports = async (guild, user) => {
    if (isRightGuild(guild.id)) {
        ModerationLog.processMemberRemove(
            await bot.users.fetch(user.id),
            true
        );
    }
};
