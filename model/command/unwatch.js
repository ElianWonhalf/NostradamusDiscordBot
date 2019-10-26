const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');
const WatchedMember = require('../watched-member');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: [],
    process: async (message) => {
        const member = await Guild.getMemberFromMessage(message);

        if (Guild.isMemberMod(member)) {
            const memberToUnwatch = Guild.findDesignatedMemberInMessage(message);

            if (memberToUnwatch.certain === true && memberToUnwatch.foundMembers.length > 0) {
                WatchedMember.remove(memberToUnwatch.foundMembers[0].id).then(() => {
                    message.reply(trans(
                        'model.command.unwatch.success',
                        [memberToUnwatch.foundMembers[0].toString()],
                        'en'
                    ));
                }).catch((error) => {
                    Logger.error(error.message);
                });
            } else {
                message.reply(trans('model.command.unwatch.error'));
            }
        }
    }
};
