const Guild = require('../../model/guild');
const StatVocal = require('../../model/stat-vocal');

module.exports = () => {
    Guild.discordGuild.members.cache.filter(member => {
        return member.voice.channel !== null && member.voice.channel !== undefined;
    }).forEach(member => {
        StatVocal.save(member.id, '+1');
    });
};