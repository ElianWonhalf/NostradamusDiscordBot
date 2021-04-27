const Config = require('../config.json');
const Guild = require('./guild');

const VCTextVisibility = {
    /**
     * @param {VoiceState} oldVoiceState
     * @param {VoiceState} newVoiceState
     */
    voiceStateUpdateHandler: async (oldVoiceState, newVoiceState) => {
        const voiceChannels = [oldVoiceState.channel, newVoiceState.channel].filter(channel => channel && Config.voiceTextChannelMappings[channel.id]);

        await Promise.all(voiceChannels.map(voiceChannel => {
            const textChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.voiceTextChannelMappings[voiceChannel.id]);
            const viewable = voiceChannel.members.size > 0 ? null : false;

            return textChannel.updateOverwrite(Guild.discordGuild.roles.everyone, {VIEW_CHANNEL: viewable});
        }));
    }
}

module.exports = VCTextVisibility;
