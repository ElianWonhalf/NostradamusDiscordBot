const StatProfileChange = require('../../model/stat-profile-change');
const Blacklist = require('../../model/blacklist');
const Guild = require('../../model/guild');

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

        const semiWords = Blacklist.getSemiWordsInString(newMember.nickname);
        const fullWords = Blacklist.getFullWordsInString(newMember.nickname);
        const formattedNickname = Blacklist.formatWordsInString(newMember.nickname);

        if (fullWords.length > 0) {
            Guild.automodChannel.send(
                trans(
                    'model.guild.nicknameFullBlacklist',
                    [newMember.toString(), formattedNickname],
                    'en'
                )
            )
        } else if (semiWords.length > 0) {
            Guild.automodChannel.send(
                trans(
                    'model.guild.nicknameSemiBlacklist',
                    [newMember.toString(), formattedNickname],
                    'en'
                )
            )
        }
    }
};
