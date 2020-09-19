const Config = require('../../config.json');
const StatProfileChange = require('../../model/stat-profile-change');
const Blacklist = require('../../model/blacklist');
const Guild = require('../../model/guild');

const nicknameChangedHandler = (oldMember, newMember) => {
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
};

/**
 * @param {GuildMember} member
 * @param {Collection} addedRoles
 * @param {Collection} removedRoles
 */
const rolesChangedHandler = (member, addedRoles, removedRoles) => {
    if (addedRoles.keyArray().includes(Config.roles.patreonBooster)) {
        Guild.announcePatreonBooster(member);
    }

    if (addedRoles.keyArray().includes(Config.roles.raid)) {
        Guild.raiderHandler(member);
    }
};

/**
 * @param {GuildMember} oldMember
 * @param {GuildMember} newMember
 */
module.exports = (oldMember, newMember) => {
    const hasNickname = newMember.nickname !== null && newMember.nickname !== undefined;
    const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.keyArray().includes(role.id));
    const removedRoles = oldMember.roles.cache.filter(role => !newMember.roles.cache.keyArray().includes(role.id));

    if (isRightGuild(oldMember.guild.id)) {
        if (oldMember.nickname !== newMember.nickname && hasNickname) {
            nicknameChangedHandler(oldMember, newMember);
        }

        if (addedRoles.size > 0 || removedRoles.size > 0) {
            rolesChangedHandler(newMember, addedRoles, removedRoles);
        }
    }
};
