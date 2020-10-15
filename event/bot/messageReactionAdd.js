const SocialNetworkIntegration = require('../../model/social-network-integration');
const MemberRolesFlow = require('../../model/member-roles-flow');
const DM = require('../../model/dm');

/**
 * @param {MessageReaction} reaction
 * @param {User} user
 */
module.exports = async (reaction, user) => {
    if (reaction.message.guild === null || isRightGuild(reaction.message.guild.id)) {
        SocialNetworkIntegration.handleReaction(reaction, user);
        MemberRolesFlow.handleReaction(reaction, user);
        DM.handleReaction(reaction, user);
    }
};
