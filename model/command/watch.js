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
            const memberToWatch = Guild.findDesignatedMemberInMessage(message);

            if (memberToWatch.certain === true && memberToWatch.foundMembers.length > 0) {
                if (!WatchedMember.isMemberWatched(memberToWatch.foundMembers[0])) {
                    WatchedMember.add(memberToWatch.foundMembers[0].id).then(() => {
                        message.reply(trans(
                            'model.command.watch.success',
                            [memberToWatch.foundMembers[0].toString()],
                            'en'
                        ));
                    }).catch((error) => {
                        Logger.error(error.message);
                    });
                } else {
                    message.reply(trans(
                        'model.command.watch.alreadyWatched',
                        [memberToWatch.foundMembers[0].toString()],
                        'en'
                    ));
                }
            } else {
                message.reply(trans('model.command.watch.error', [], 'en'));
            }
        }
    }
};
