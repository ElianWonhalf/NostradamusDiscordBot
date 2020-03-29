const Config = require('../../config.json');
const ModerationLog = require('../../model/moderation-log');

/**
 * @param {Guild} guild
 * @param {User} user
 */
module.exports = async (guild, user) => {
    if (!testMode && user.id !== Config.testAccount || testMode && user.id === Config.testAccount) {
        ModerationLog.processMemberRemove(
            await bot.users.fetch(user.id),
            true
        );
    }
};
