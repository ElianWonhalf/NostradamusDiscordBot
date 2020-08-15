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
            if (WatchedMember.isMemberWatched(target.id)) {
                WatchedMember.edit(target.id, reason).then(() => {
                    message.channel.send(trans(
                        'model.command.watch.edit.success',
                        [target.toString()],
                        'en'
                    ));
                }).catch((error) => {
                    Logger.error(error.message);
                });
            } else {
                await message.channel.send(trans(
                    'model.command.watch.edit.redirect',
                    [target.toString()],
                    'en'
                ));
                (require('./add.js'))(message, reason, target);
            }
        }
    } else {
        message.reply(trans('model.command.watch.edit.noReason'));
    }
};
