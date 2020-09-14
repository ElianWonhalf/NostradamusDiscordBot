const CommandPermission = require('../../command-permission');
const StatProfileChange = require('../../stat-profile-change');

/**
 * @param {Message} message
 * @param {User|GuildMember} target
 */
module.exports = async (message, target) => {
    if (await CommandPermission.isMemberModOrSoftOrTutor(message)) {
        const nicknames = await StatProfileChange.getNicknameList(target.id);

        if (nicknames.length > 0) {
            message.channel.send(
                nicknames.map(nickname => `\`${nickname.replace(/`/gu, '\\`')}\``).join(', '),
                {split: {char: ', '}}
            );
        } else {
            message.channel.send(trans('model.command.info.nicknames.none', [], 'en'));
        }
    }
};
