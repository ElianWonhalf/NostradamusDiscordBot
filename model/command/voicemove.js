const Guild = require('../guild');

/**
 * @param {Message} message
 */
module.exports = (message) => {
    const member = Guild.getMemberFromMessage(message);

    if (Guild.isMemberMod(member)) {
        Guild.addMemberToVoiceStateUpdateWatcher(member.id, setTimeout(() => {
            Guild.removeMemberFromVoiceStateUpdateWatcher(member.id);
            message.reply(trans('model.command.voicemove.timeout', [], 'en'));
        }, 5 * 60 * 1000));

        message.reply(trans('model.command.voicemove.ready', [], 'en'));
    }
};
