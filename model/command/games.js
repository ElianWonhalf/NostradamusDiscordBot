const Config = require('../../config.json');
const Guild = require('../guild');
const CommandCategory = require('../command-category');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['game', 'jeu', 'jeux'],
    category: CommandCategory.ROLE,
    process: async (message) => {
        const member = await Guild.getMemberFromMessage(message);

        if (member.roles.has(Config.roles.games)) {
            member.removeRole(Config.roles.games).then(() => {
                message.reply(trans('model.command.games.alertsOff'));
            });
        } else {
            member.addRole(Config.roles.games).then(() => {
                message.reply(trans('model.command.games.alertsOn'));
            });
        }
    }
};
