const Config = require('../../config.json');
const Guild = require('../../model/guild');
const WatchedMember = require('../../model/watched-member');

/**
 * @param {GuildMember} oldMember
 * @param {GuildMember} newMember
 */
module.exports = (oldMember, newMember) => {
    if (!testMode && oldMember.user.id !== Config.testAccount || testMode && oldMember.user.id === Config.testAccount) {
        if (oldMember.voiceChannel !== undefined && newMember.voiceChannel !== undefined) {
            const memberCalledVoiceMove = Object.keys(Guild.voiceMoveMembers).indexOf(oldMember.id) > -1;
            const sourceChannel = oldMember.voiceChannel;
            const destChannel = newMember.voiceChannel;
            const connectedInDifferentChannel = oldMember.voiceChannel.id !== newMember.voiceChannel.id;

            if (memberCalledVoiceMove && connectedInDifferentChannel) {
                clearInterval(Guild.voiceMoveMembers[oldMember.id]);
                delete Guild.voiceMoveMembers[oldMember.id];

                sourceChannel.members.array().filter(member => !member.user.bot).forEach(
                    member => member.setVoiceChannel(destChannel)
                );
            }
        }

        WatchedMember.voiceStateUpdateHandler(oldMember, newMember);
    }
};
