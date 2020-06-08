const Config = require('../../config.json');
const Guild = require('../../model/guild');
const MemberRolesFlow = require('../../model/member-roles-flow');
const WatchedMember = require('../../model/watched-member');

/**
 * @param {GuildMember} member
 */
module.exports = async (member) => {
    WatchedMember.guildMemberAddHandler(member);

    if (isRightGuild(member.guild.id)) {
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
