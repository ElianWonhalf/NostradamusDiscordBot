const Config = require('../../config.json');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class MiniClass
{
    static instance = null;

    constructor() {
        if (MiniClass.instance !== null) {
            return MiniClass.instance;
        }

        this.aliases = ['miniclass', 'miniclasse', 'mini-classe', 'minicours', 'mini-cours'];
        this.category = CommandCategory.ROLE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
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
}

module.exports = new MiniClass();
