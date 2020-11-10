const Logger = require('@lilywonhalf/pretty-logger');
const Config = require('../../config.json');
const Guild = require('../../model/guild');
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

        // Handle private voice channel requests
        if (newVoiceState.channel !== undefined && newVoiceState.channelID === Config.channels.smallVoiceChatRequest) {
            await Promise.all([
                member.guild.channels.create(`[Private] ${member.displayName}`, {
                    type: 'voice',
                    parent: Guild.smallVoiceCategoryChannel,
                }),
                member.guild.channels.create("[Waiting room] ⬆️", {
                    type: 'voice',
                    parent: Guild.smallVoiceCategoryChannel,
                })
            ]).then(([privateChannel]) => member.voice.setChannel(privateChannel));
        }

        WatchedMember.voiceStateUpdateHandler(oldVoiceState, newVoiceState);
    }
};
