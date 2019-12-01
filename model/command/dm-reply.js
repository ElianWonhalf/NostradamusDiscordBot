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

			if (content.length > 0) {
				const answer = content.join(' ');

				if (bot.users.has(recipientId)) {
					const embed = await Guild.messageToEmbed(message);

					embed.setDescription(answer);

					bot.users.get(recipientId).send({
	    				embed: embed,
	    				files: message.attachments.map(messageAttachment => {
	        				return new Discord.Attachment(messageAttachment.url, messageAttachment.filename);
	   					})
					}).then(() => {
	                	const emoji = bot.emojis.find(emoji => emoji.name === 'pollyes');
	                	message.react(emoji);
	            	}).catch((exception) => {
	                	const emoji = bot.emojis.find(emoji => emoji.name === 'pollno');

	                	message.react(emoji);
	                	Logger.exception(exception);
	                });
				} else {
	        		message.reply(trans('model.command.dmReply.notFound', [], 'en'));
				}
			} else {
				message.reply(trans('model.command.dmReply.noMessage', [], 'en'));
			}
        }
    }
};
