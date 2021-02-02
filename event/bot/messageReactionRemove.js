const Correction = require('../../model/correction');
const Starboard = require('../../model/starboard');

/**
 * @param {MessageReaction} reaction
 * @param {User} user
 */
module.exports = async (reaction, user) => {
    if (reaction.message.guild === null || isRightGuild(reaction.message.guild.id)) {
        Correction.handleReactionRemove(reaction, user);
        Starboard.handleReaction(reaction);
    }
};
