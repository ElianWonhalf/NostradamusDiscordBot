const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');
const WatchedMember = require('../watched-member');
const CommandCategory = require('../command-category');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: [],
    category: CommandCategory.MODERATION,
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
