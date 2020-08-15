const Logger = require('@lilywonhalf/pretty-logger');
const WatchedMember = require('../../watched-member');

/**
 * @param {Message} message
 * @param {string} reason
 * @param {Array<User|GuildMember>} targets
 */
module.exports = async (message, reason, targets) => {
    if (reason.length > 0) {
        for (const target of targets) {
            if (!WatchedMember.isMemberWatched(target.id)) {
                WatchedMember.add(target.id, reason).then(() => {
                    message.channel.send(trans(
                        'model.command.watch.add.success',
                        [target.toString()],
                        'en'
                    ));
                }).catch((error) => {
                    Logger.error(error.message);
                });
            } else {
                message.channel.send(trans(
                    'model.command.watch.add.alreadyWatched',
                    [target.toString()],
                    'en'
                ));
            }
        }
    } else {
        message.reply(trans('model.command.watch.add.noReason', [], 'en'));
    }
};
