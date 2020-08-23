const Logger = require('@lilywonhalf/pretty-logger');
const StatInviteLinks = require('../../model/stat-invite-links');
const WatchedMember = require('../../model/watched-member');

/**
 * @param {Invite} invite
 */
module.exports = (invite) => {
    const inviterIsSet = invite.inviter !== undefined && invite.inviter !== null;
    const guildIsSet = invite.guild !== undefined && invite.guild !== null;

    if (inviterIsSet && guildIsSet && isRightGuild(invite.guild.id)) {
        StatInviteLinks.save(invite.inviter.id, '+1');
        WatchedMember.inviteCreateHandler(invite);
    }
};
