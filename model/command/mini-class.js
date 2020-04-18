const Config = require('../../config.json');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['miniclass', 'miniclasse', 'mini-classe', 'minicours', 'mini-cours'],
    category: CommandCategory.ROLE,
    isAllowedForContext: CommandPermission.notInWelcome,
    process: async (message) => {
        const member = await Guild.getMemberFromMessage(message);

        if (member.roles.cache.has(Config.roles.miniClass)) {
            member.roles.remove(Config.roles.miniClass).then(() => {
                message.reply(trans('model.command.miniClass.alertsOff'));
            });
        } else {
            member.roles.add(Config.roles.miniClass).then(() => {
                message.reply(trans('model.command.miniClass.alertsOn'));
            });
        }
    }
};
