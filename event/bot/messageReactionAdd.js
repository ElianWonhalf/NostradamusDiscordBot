const Config = require('../../config.json');
const SocialNetworkIntegration = require('../../model/social-network-integration');
const MemberRolesFlow = require('../../model/member-roles-flow');

/**
 * @param {MessageReaction} reaction
 * @param {User} user
 */
module.exports = async (reaction, user) => {
    SocialNetworkIntegration.handleReaction(reaction, user);

    if (!testMode && user.id !== Config.testAccount || testMode && user.id === Config.testAccount) {
        MemberRolesFlow.handleReaction(reaction, user);
    }
};
