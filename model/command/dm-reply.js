const Logger = require('@lilywonhalf/pretty-logger');
const Discord = require('discord.js');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['dmreply','dm'],
    category: CommandCategory.MODERATION,
    isAllowedForContext: CommandPermission.isMemberMod,
    process: async (message, content) => {
		const recipientId = content.shift();

		if (content.length > 0) {
			const answer = content.join(' ');

			if (bot.users.cache.has(recipientId)) {
				const embed = await Guild.messageToEmbed(message);

				embed.setDescription(answer);
				embed.setTimestamp(message.createdTimestamp);

				bot.users.cache.get(recipientId).send({
					embed: embed,
					files: message.attachments.map(messageAttachment => {
						return new Discord.MessageAttachment(messageAttachment.url, messageAttachment.filename);
					})
				}).then(() => {
					const emoji = bot.emojis.cache.find(emoji => emoji.name === 'pollyes');
					message.react(emoji);
				}).catch((exception) => {
					const emoji = bot.emojis.cache.find(emoji => emoji.name === 'pollno');

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
};
