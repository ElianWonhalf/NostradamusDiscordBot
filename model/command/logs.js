const Config = require('../../config.json');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class Logs
{
    static instance = null;

    constructor() {
        if (Logs.instance !== null) {
            return Logs.instance;
        }

        this.aliases = ['log'];
        this.category = CommandCategory.ROLE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
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
}

module.exports = new Logs();
