const Config = require('../../config.json');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class Games
{
    static instance = null;

    constructor() {
        if (Games.instance !== null) {
            return Games.instance;
        }

        this.aliases = ['game', 'jeu', 'jeux'];
        this.category = CommandCategory.ROLE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
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
}

module.exports = new Games();
