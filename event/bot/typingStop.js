const Guild = require('../../model/guild');

/**
 * @param {Channel} channel
 */
module.exports = (channel) => {
    if (channel.type === 'dm') {
        Guild.botChannel.stopTyping();
    }
};
