const SocialNetworkIntegration = require('../../model/social-network-integration');

/**
 * @param {MessageReaction} reaction
 * @param {User} user
 */
module.exports = async (reaction, user) => {
    SocialNetworkIntegration.handleReaction(reaction, user);
};
