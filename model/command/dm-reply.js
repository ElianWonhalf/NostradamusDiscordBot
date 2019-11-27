const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['dmreply'],
    process: async (message, content) => {
        const member = await Guild.getMemberFromMessage(message);

        if (Guild.isMemberMod(member)) {
			const recipientId = content.shift();
			const answer = content.join(' ');

			if (bot.users.has(recipientId)) {
				bot.users.get(recipientId).send(answer);
			} else {
        		message.reply(trans('model.command.dmReply.notFound', [], 'en'));
			}
        }
    }
};
