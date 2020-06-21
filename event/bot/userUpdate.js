const StatProfileChange = require('../../model/stat-profile-change');
const Blacklist = require('../../model/blacklist');
const Guild = require('../../model/guild');

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

        const semiWords = Blacklist.getSemiWordsInString(newUser.username);
        const fullWords = Blacklist.getFullWordsInString(newUser.username);
        const formattedUsername = Blacklist.formatWordsInString(newUser.username);

        if (fullWords.length > 0) {
            Guild.automodChannel.send(
                trans(
                    'model.guild.usernameFullBlacklist',
                    [newUser.toString(), formattedUsername],
                    'en'
                )
            )
        } else if (semiWords.length > 0) {
            Guild.automodChannel.send(
                trans(
                    'model.guild.usernameSemiBlacklist',
                    [newUser.toString(), formattedUsername],
                    'en'
                )
            )
        }
    }

    if (oldUser.avatar !== newUser.avatar) {
        StatProfileChange.save(
            newUser.id,
            newUser.displayAvatarURL({ dynamic: true }),
            { type: StatProfileChange.constructor.TYPE_AVATAR }
        );
    }
};
