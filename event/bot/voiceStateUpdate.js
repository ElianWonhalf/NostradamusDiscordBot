const Logger = require('@lilywonhalf/pretty-logger');
const Config = require('../../config.json');
const Guild = require('../../model/guild');
const PrivateVC = require('../../model/private-vc');
const WatchedMember = require('../../model/watched-member');

/**
 * @param {VoiceState} oldVoiceState
 * @param {VoiceState} newVoiceState
 */
module.exports = async (oldVoiceState, newVoiceState) => {
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

        // Private VC handlers
        const channelIDs = PrivateVC.list[member.id];
        if (newVoiceState.channel !== undefined && newVoiceState.channelID === Config.channels.smallVoiceChatRequest) { // Request new VC
            PrivateVC.privateVoiceChatRequestHandler(oldVoiceState);
        } else if (channelIDs !== undefined && oldVoiceState.channel !== undefined && oldVoiceState.channelID === channelIDs[1]) { // Delete VC
            PrivateVC.privateVoiceChatDeletionHandler(oldVoiceState);
        } else if (newVoiceState.channel !== null) { // Join private VC
            const requestor = Object.keys(PrivateVC.list).find(id => PrivateVC.list[id][2] === newVoiceState.channelID);
            if (requestor !== undefined) {
                PrivateVC.privateVoiceChatJoinHandler(requestor, newVoiceState);
            }
        } else if (oldVoiceState.channel !== null) { // Leave VC
            const requestor = Object.keys(PrivateVC.list).find(id => PrivateVC.list[id][1] === oldVoiceState.channelID);
            if (requestor !== undefined) {
                PrivateVC.privateVoiceChatLeaveHandler(requestor, oldVoiceState);
            }
        }

        WatchedMember.voiceStateUpdateHandler(oldVoiceState, newVoiceState);
    }
};
