const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['getmemberid', 'memberid', 'gmid'],
    process: async (message) => {
        const member = await Guild.getMemberFromMessage(message);

        if (Guild.isMemberMod(member)) {
            const result = Guild.findDesignatedMemberInMessage(message);

            if (result.foundMembers.length > 0) {
            	message.channel.send(result.foundMembers[0]);
            	message.channel.send(result.foundMembers[0].id);
        	} else {
        		message.reply(trans('model.command.getMemberId.notFound', [], 'en'));
			}
        }
    }
};
