const Config = require('../../config.json');
const SocialNetworkIntegration = require('../../model/social-network-integration');
const MemberRolesFlow = require('../../model/member-roles-flow');

/**
 * @param {MessageReaction} reaction
 * @param {User} user
 */
module.exports = async (reaction, user) => {
    SocialNetworkIntegration.handleReaction(reaction, user);

    if (reaction.message.guild === null || isRightGuild(reaction.message.guild.id)) {
        MemberRolesFlow.handleReaction(reaction, user);
    }
};
