const CommandPermission = require('../../command-permission');
const StatProfileChange = require('../../stat-profile-change');

/**
 * @param {Message} message
 * @param {User|GuildMember} target
 */
module.exports = async (message, target) => {
    if (await CommandPermission.isMemberModOrSoftOrTutor(message)) {
        const usernames = await StatProfileChange.getUsernameList(target.id);

        if (usernames.length > 0) {
            message.channel.send(
                usernames.map(username => `\`${username.replace(/`/gu, '\\`')}\``).join(', '),
                {split: {char: ', '}}
            );
        } else {
            message.channel.send(trans('model.command.info.usernames.none', [], 'en'));
        }
    }
};
