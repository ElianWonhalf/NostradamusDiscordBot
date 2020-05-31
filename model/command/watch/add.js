const Logger = require('@elian-wonhalf/pretty-logger');
const WatchedMember = require('../../watched-member');

/**
 * @param {Message} message
 * @param {Array} args
 * @param {Object} target
 */
module.exports = async (message, args, target) => {
    if (args.length > 2) {
        if (!WatchedMember.isMemberWatched(target.id)) {
            args.shift(); // Remove the action
            args.shift(); // Remove the member
            const reason = args.join(' ');

            WatchedMember.add(target.id, reason).then(() => {
                message.reply(trans(
                    'model.command.watch.add.success',
                    [target.label],
                    'en'
                ));
            }).catch((error) => {
                Logger.error(error.message);
            });
        } else {
            message.reply(trans(
                'model.command.watch.add.alreadyWatched',
                [target.label],
                'en'
            ));
        }
    } else {
        message.reply(trans('model.command.watch.add.noReason', [], 'en'));
    }
};
