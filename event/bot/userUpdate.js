const StatProfileChange = require('../../model/stat-profile-change');

/**
 * @param {User} oldUser
 * @param {User} newUser
 */
module.exports = (oldUser, newUser) => {
    if (oldUser.username !== newUser.username) {
        StatProfileChange.save(
            newUser.id,
            newUser.username,
            { type: StatProfileChange.constructor.TYPE_USERNAME }
        );
    }

    if (oldUser.avatar !== newUser.avatar) {
        StatProfileChange.save(
            newUser.id,
            newUser.displayAvatarURL({ dynamic: true }),
            { type: StatProfileChange.constructor.TYPE_AVATAR }
        );
    }
};
