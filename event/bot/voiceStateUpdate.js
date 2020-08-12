const Guild = require('../../model/guild');
const WatchedMember = require('../../model/watched-member');

/**
 * @param {VoiceState} oldVoiceState
 * @param {VoiceState} newVoiceState
 */
module.exports = (oldVoiceState, newVoiceState) => {
    const member = oldVoiceState.member;

    if (typeof oldVoiceState.channelID === 'undefined') {
        oldVoiceState.channelID = null;
    }

    if (typeof newVoiceState.channelID === 'undefined') {
        newVoiceState.channelID = null;
    }

    if (isRightGuild(member.guild.id)) {
        if (oldVoiceState.channel !== undefined && newVoiceState.channel !== undefined) {
            const memberCalledVoiceMove = Object.keys(Guild.voiceMoveMembers).indexOf(member.id) > -1;
            const sourceChannel = oldVoiceState.channel;
            const destChannel = newVoiceState.channel;
            const connectedInDifferentChannel = oldVoiceState.channel === null
                || newVoiceState.channel === null
                || oldVoiceState.channel.id !== newVoiceState.channel.id;

            if (memberCalledVoiceMove && connectedInDifferentChannel) {
                clearInterval(Guild.voiceMoveMembers[member.id]);
                delete Guild.voiceMoveMembers[member.id];

                sourceChannel.members.array().filter(member => !member.user.bot).forEach(
                    member => member.voice.setChannel(destChannel)
                );
            }
        }

        WatchedMember.voiceStateUpdateHandler(oldVoiceState, newVoiceState);
    }
};
