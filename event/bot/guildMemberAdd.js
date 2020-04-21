const Config = require('../../config.json');
const Guild = require('../../model/guild');
const MemberRolesFlow = require('../../model/member-roles-flow');

/**
 * @param {GuildMember} member
 */
module.exports = async (member) => {
    if (!testMode && member.id !== Config.testAccount || testMode && member.id === Config.testAccount) {
        setTimeout(async () => {
            const message = await Guild.welcomeChannel.send(
                trans(
                    'bot.welcomeMessage',
                    [
                        member.user,
                        Guild.discordGuild.name,
                        [Config.learntLanguage],
                        [Config.learntLanguage]
                    ]
                )
            );

            MemberRolesFlow.introduction(message);
        }, 2000);
    }
};
