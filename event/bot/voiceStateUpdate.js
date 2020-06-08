const Config = require('../../config.json');
const Guild = require('../../model/guild');
const WatchedMember = require('../../model/watched-member');

/**
 * @param {VoiceState} oldVoiceState
 * @param {VoiceState} newVoiceState
 */
module.exports = (oldVoiceState, newVoiceState) => {
    const oldMember = oldVoiceState.member;
    const newMember = newVoiceState.member;

    if (isRightGuild(oldMember.guild)) {
        if (oldVoiceState.channel !== undefined && newVoiceState.channel !== undefined) {
            const memberCalledVoiceMove = Object.keys(Guild.voiceMoveMembers).indexOf(oldMember.id) > -1;
            const sourceChannel = oldVoiceState.channel;
            const destChannel = newVoiceState.channel;
            const connectedInDifferentChannel = oldVoiceState.channel === null
                || newVoiceState.channel === null
                || oldVoiceState.channel.id !== newVoiceState.channel.id;

            if (memberCalledVoiceMove && connectedInDifferentChannel) {
                clearInterval(Guild.voiceMoveMembers[oldMember.id]);
                delete Guild.voiceMoveMembers[oldMember.id];

                sourceChannel.members.array().filter(member => !member.user.bot).forEach(
                    member => member.voice.setChannel(destChannel)
                );
            }
        }

        WatchedMember.voiceStateUpdateHandler(oldMember, newMember);
    }
};
