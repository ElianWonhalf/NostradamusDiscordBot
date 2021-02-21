const SocialNetworkIntegration = require('../../model/social-network-integration');
const MemberRolesFlow = require('../../model/member-roles-flow');
const DM = require('../../model/dm');
const OnDemandVC = require('../../model/on-demand-vc');
const Correction = require('../../model/correction');
const Starboard = require('../../model/starboard');

/**
 * @param {MessageReaction} reaction
 * @param {User} user
 */
module.exports = async (reaction, user) => {
    if (reaction.message.guild === null || isRightGuild(reaction.message.guild.id)) {
        SocialNetworkIntegration.handleReaction(reaction, user);
        MemberRolesFlow.handleReaction(reaction, user);
        DM.handleReaction(reaction, user);
        OnDemandVC.handleReaction(reaction, user);
        Correction.handleReaction(reaction, user);
        Starboard.handleReaction(reaction);
    }
};
