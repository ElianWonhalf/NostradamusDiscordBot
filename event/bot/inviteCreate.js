const StatInviteLinks = require('../../model/stat-invite-links');

/**
 * @param {Invite} invite
 */
module.exports = (invite) => {
    if (invite.inviter !== undefined && invite.inviter !== null) {
        StatInviteLinks.save(invite.inviter.id, '+1');
    }
};
