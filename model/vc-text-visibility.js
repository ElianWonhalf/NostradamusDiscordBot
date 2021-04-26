const Config = require('../config.json');
const Guild = require('./guild');

const VCTextVisibility = {
    /**
     * @param {VoiceState} oldVoiceState
     * @param {VoiceState} newVoiceState
     */
    voiceStateUpdateHandler: async (oldVoiceState, newVoiceState) => {
        const voiceChannel = oldVoiceState.channel ? oldVoiceState.channel : newVoiceState.channel;
        const textChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.voiceTextChannelMappings[voiceChannel.id]);
        let viewable = voiceChannel.members.size > 0;
        await textChannel.updateOverwrite(Guild.discordGuild.roles.everyone, {VIEW_CHANNEL: viewable});
    }
}

module.exports = VCTextVisibility;
