const Config = require('../../config.json');
const Guild = require('../guild');
const CommandCategory = require('../command-category');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['dictee', 'dictée'],
    category: CommandCategory.ROLE,
    process: async (message) => {
        const member = await Guild.getMemberFromMessage(message);

        if (member.roles.cache.has(Config.roles.dictation)) {
            member.roles.remove(Config.roles.dictation).then(() => {
                message.reply(trans('model.command.dictation.alertsOff'));
            });
        } else {
            member.roles.add(Config.roles.dictation).then(() => {
                message.reply(trans('model.command.dictation.alertsOn'));
            });
        }
    }
};
