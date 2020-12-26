const SocialNetworkIntegration = require('../../model/social-network-integration');
const MemberRolesFlow = require('../../model/member-roles-flow');
const DM = require('../../model/dm');
const Correction = require('../../model/correction');

/**
 * @param {MessageReaction} reaction
 * @param {User} user
 */
module.exports = async (reaction, user) => {
    if (reaction.message.guild === null || isRightGuild(reaction.message.guild.id)) {
        Correction.handleReactionRemove(reaction, user);
    }
};
