const CommandPermission = require('../../command-permission');
const StatProfileChange = require('../../stat-profile-change');

/**
 * @param {Message} message
 * @param {User|GuildMember} target
 */
module.exports = async (message, target) => {
    if (await CommandPermission.isMemberModOrSoftOrTutor(message)) {
        const avatars = await StatProfileChange.getAvatarList(target.id);

        if (avatars.length > 0) {
            message.channel.send(avatars.join(', '), {split: {char: ', '}});
        } else {
            message.channel.send(trans('model.command.info.avatars.none', [], 'en'));
        }
    }
};
