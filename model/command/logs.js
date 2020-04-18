const Config = require('../../config.json');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['log'],
    category: CommandCategory.ROLE,
    isAllowedForContext: CommandPermission.notInWelcome,
    process: async (message) => {
        const member = await Guild.getMemberFromMessage(message);

        if (member.roles.cache.has(Config.roles.logs)) {
            member.roles.remove(Config.roles.logs).then(() => {
                message.reply(trans('model.command.logs.channelOff'));
            });
        } else {
            member.roles.add(Config.roles.logs).then(() => {
                message.reply(trans('model.command.logs.channelOn'));
            });
        }
    }
};
