const Config = require('../../config.json');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class HideSeek
{
    static instance = null;

    constructor() {
        if (HideSeek.instance !== null) {
            return HideSeek.instance;
        }

        this.aliases = [
            'hideseek',
            'hide-and-seek',
            'hideandseek',
            'cache-cache',
            'cachecache'
        ];
        this.category = CommandCategory.ROLE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        const member = await Guild.getMemberFromMessage(message);

        if (member.roles.cache.has(Config.roles.hideSeek)) {
            member.roles.remove(Config.roles.hideSeek).then(() => {
                message.reply(trans('model.command.hideSeek.alertsOff'));
            });
        } else {
            member.roles.add(Config.roles.hideSeek).then(() => {
                message.reply(trans('model.command.hideSeek.alertsOn'));
            });
        }
    }
}

module.exports = new HideSeek();
