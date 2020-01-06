const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');
const CommandCategory = require('../command-category');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['reboot'],
    category: CommandCategory.BOT_MANAGEMENT,
    process: async (message) => {
        const member = await Guild.getMemberFromMessage(message);

        if (Guild.isMemberMod(member)) {
            await message.reply(trans('model.command.reload.answer', [], 'en'));
            Logger.notice('Reboot asked');
        }
    }
};
