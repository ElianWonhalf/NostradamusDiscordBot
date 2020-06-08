const StatInviteLinks = require('../../model/stat-invite-links');

/**
 * @param {Invite} invite
 */
module.exports = (invite) => {
    const inviterIsSet = invite.inviter !== undefined && invite.inviter !== null;
    const guildIsSet = invite.guild !== undefined && invite.guild !== null;

    if (inviterIsSet && guildIsSet && isRightGuild(invite.guild.id)) {
        StatInviteLinks.save(invite.inviter.id, '+1');
    }
};
