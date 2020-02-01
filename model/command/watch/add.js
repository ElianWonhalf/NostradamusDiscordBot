const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../../guild');
const WatchedMember = require('../../watched-member');

/**
 * @param {Message} message
 * @param {Array} args
 */
module.exports = async (message, args) => {
    if (args.length > 2) {
        const memberToWatch = Guild.findDesignatedMemberInMessage(message);

        if (memberToWatch.certain === true && memberToWatch.foundMembers.length > 0) {
            if (!WatchedMember.isMemberWatched(memberToWatch.foundMembers[0])) {
                args.shift(); // Remove the action
                args.shift(); // Remove the member
                const reason = args.join(' ');

                WatchedMember.add(memberToWatch.foundMembers[0].id, reason).then(() => {
                    message.reply(trans(
                        'model.command.watch.add.success',
                        [memberToWatch.foundMembers[0].toString()],
                        'en'
                    ));
                }).catch((error) => {
                    Logger.error(error.message);
                });
            } else {
                message.reply(trans(
                    'model.command.watch.add.alreadyWatched',
                    [memberToWatch.foundMembers[0].toString()],
                    'en'
                ));
            }
        } else {
            message.reply(trans('model.command.watch.add.error', [], 'en'));
        }
    } else {
        message.reply(trans('model.command.watch.add.noReason', [], 'en'));
    }
};
