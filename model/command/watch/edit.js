const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../../guild');
const WatchedMember = require('../../watched-member');

/**
 * @param {Message} message
 * @param {Array} args
 */
module.exports = async (message, args) => {
    const memberToWatch = Guild.findDesignatedMemberInMessage(message);

    if (memberToWatch.certain === true && memberToWatch.foundMembers.length > 0) {
        if (args.length > 2) {
            if (WatchedMember.isMemberWatched(memberToWatch.foundMembers[0])) {
                args.shift(); // Remove the action
                args.shift(); // Remove the member
                const reason = args.join(' ');

                WatchedMember.edit(memberToWatch.foundMembers[0].id, reason).then(() => {
                    message.reply(trans(
                        'model.command.watch.edit.success',
                        [memberToWatch.foundMembers[0].toString()],
                        'en'
                    ));
                }).catch((error) => {
                    Logger.error(error.message);
                });
            } else {
                await message.reply(trans(
                    'model.command.watch.edit.redirect',
                    [memberToWatch.foundMembers[0].toString()],
                    'en'
                ));
                (require('./add.js'))(message, args);
            }
        } else {
            message.reply(trans('model.command.watch.edit.noReason'));
        }
    } else {
        message.reply(trans('model.command.watch.edit.error', [], 'en'));
    }
};
