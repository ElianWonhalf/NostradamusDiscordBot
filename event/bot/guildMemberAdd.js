const Config = require('../../config.json');
const Guild = require('../../model/guild');
const MemberRolesFlow = require('../../model/member-roles-flow');
const WatchedMember = require('../../model/watched-member');
const StatMemberFlow = require('../../model/stat-member-flow');

/**
 * @param {GuildMember} member
 */
module.exports = async (member) => {
    if (isRightGuild(member.guild.id)) {
        StatMemberFlow.save(member.id, StatMemberFlow.constructor.MEMBER_FLOW_EVENT_JOINED);
        WatchedMember.guildMemberAddHandler(member);

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
