const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: [],
    process: async (message) => {
        const member = await Guild.getMemberFromMessage(message);

        if (Guild.isMemberMod(member)) {
            Logger.notice('killnostrapls');
        }
    }
};
