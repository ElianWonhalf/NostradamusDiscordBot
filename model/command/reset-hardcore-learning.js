const Guild = require('../guild');
const HardcoreLearning = require('../hardcore-learning');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: [],
    process: async (message) => {
        const member = await Guild.getMemberFromMessage(message);

        if (Guild.isMemberMod(member)) {
            HardcoreLearning.reset();
        }
    }
};
