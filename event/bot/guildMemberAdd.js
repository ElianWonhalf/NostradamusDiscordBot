const Config = require('../../config.json');
const Guild = require('../../model/guild');

/**
 * @param {GuildMember} member
 */
module.exports = (member) => {
    if (!testMode && member.user.id !== Config.testAccount || testMode && member.user.id === Config.testAccount) {
        Guild.welcomeChannel.send(
            trans(
                'bot.welcomeMessage',
                [
                    member.user,
                    Guild.discordGuild.name,
                    `%${Config.learntLanguage}%`
                ]
            )
        );
    }
};
