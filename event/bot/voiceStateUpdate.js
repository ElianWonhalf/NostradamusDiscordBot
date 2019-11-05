const Config = require('../../config.json');
const Guild = require('../../model/guild');

/**
 * @param {GuildMember} oldMember
 * @param {GuildMember} newMember
 */
module.exports = (oldMember, newMember) => {
    if (!testMode && oldMember.user.id !== Config.testAccount || testMode && oldMember.user.id === Config.testAccount) {
        if (oldMember.voiceChannel !== undefined && newMember.voiceChannel !== undefined) {
            const memberIsBeingWatched = Object.keys(Guild.voiceMoveMembers).indexOf(oldMember.id) > -1;
            const sourceChannel = oldMember.voiceChannel;
            const destChannel = newMember.voiceChannel;
            const connectedInDifferentChannel = oldMember.voiceChannel.id !== newMember.voiceChannel.id;

            if (memberIsBeingWatched && connectedInDifferentChannel) {
                clearInterval(Guild.voiceMoveMembers[oldMember.id]);
                delete Guild.voiceMoveMembers[oldMember.id];

                sourceChannel.members.array().forEach(member => member.setVoiceChannel(destChannel));
            }
        }
    }
};
