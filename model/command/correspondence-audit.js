const Logger = require('@lilywonhalf/pretty-logger');
const Discord = require('discord.js');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class AuditFR
{
    static instance = null;

    constructor() {
        if (AuditFR.instance !== null) {
            return AuditFR.instance;
        }

        this.aliases = ['correspondenceaudit', 'caudit', 'c-audit', 'correspondance-audit', 'correspondanceaudit'];
        this.category = CommandCategory.MODERATION;
        this.isAllowedForContext = CommandPermission.isMemberMod;
    }

	/**
	 * @param {Message} message
	 * @param {Array} args
	 */
    async process(message, args) {
		if (args.length > 1 && ['fr', 'en'].includes(args[0])) {
            const [lang, recipientId] = args;

            if (bot.users.cache.has(recipientId)) {
                bot.users.cache.get(recipientId).send(
                    trans('model.command.correspondenceAudit.dm', [], lang)
				).then(() => {
                    const emoji = bot.emojis.cache.find(emoji => emoji.name === 'pollyes');
                    message.react(emoji);
                }).catch((exception) => {
                    const emoji = bot.emojis.cache.find(emoji => emoji.name === 'pollno');

                    message.react(emoji);
                    Logger.exception(exception);
                });
            } else {
                message.reply(trans('model.command.correspondenceAudit.notFound', [], 'en'));
            }
        } else {
            message.reply(trans('model.command.correspondenceAudit.badFormat', [], 'en'));
		}
    }
}

module.exports = new AuditFR();
