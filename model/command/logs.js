const Config = require('../../config.json');
const Guild = require('../guild');
const CommandCategory = require('../command-category');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['log'],
    category: CommandCategory.ROLE,
    process: async (message) => {
        const member = await Guild.getMemberFromMessage(message);

        if (member.roles.has(Config.roles.logs)) {
            member.removeRole(Config.roles.logs).then(() => {
                message.reply(trans('model.command.logs.channelOff'));
            });
        } else {
            member.addRole(Config.roles.logs).then(() => {
                message.reply(trans('model.command.logs.channelOn'));
            });
        }
    }
};
