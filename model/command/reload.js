const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['reboot'],
    process: async (message) => {
        const member = await Guild.getMemberFromMessage(message);

        if (Guild.isMemberMod(member)) {
            await message.reply(trans('model.command.reload.answer', [], 'en'));
            Logger.notice('Reboot asked');
        }
    }
};
