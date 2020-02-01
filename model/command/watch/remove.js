const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../../guild');
const WatchedMember = require('../../watched-member');

/**
 * @param {Message} message
 */
module.exports = async (message) => {
    const memberToUnwatch = Guild.findDesignatedMemberInMessage(message);

    if (memberToUnwatch.certain === true && memberToUnwatch.foundMembers.length > 0) {
        WatchedMember.remove(memberToUnwatch.foundMembers[0].id).then(() => {
            message.reply(trans(
                'model.command.watch.remove.success',
                [memberToUnwatch.foundMembers[0].toString()],
                'en'
            ));
        }).catch((error) => {
            Logger.error(error.message);
        });
    } else {
        message.reply(trans('model.command.watch.remove.error'));
    }
};
