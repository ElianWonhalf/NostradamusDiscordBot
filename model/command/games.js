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

        if (member.roles.cache.has(Config.roles.games)) {
            member.roles.remove(Config.roles.games).then(() => {
                message.reply(trans('model.command.games.alertsOff'));
            });
        } else {
            member.roles.add(Config.roles.games).then(() => {
                message.reply(trans('model.command.games.alertsOn'));
            });
        }
    }
};
