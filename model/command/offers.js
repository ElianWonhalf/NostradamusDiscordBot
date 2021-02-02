const Config = require('../../config.json');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class Offers
{
    static instance = null;

    constructor() {
        if (Offers.instance !== null) {
            return Offers.instance;
        }

        this.aliases = [
            'offer',
            'offres',
            'offre',
            'promotions',
            'promotion',
            'promo',
            'sponsor',
            'sponsors',
            'exclusivité',
            'exclusivite',
            'exclusive',
            'exclusif',
        ];
        this.category = CommandCategory.ROLE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        const member = await Guild.getMemberFromMessage(message);

        if (member.roles.cache.has(Config.roles.offers)) {
            member.roles.remove(Config.roles.offers).then(() => {
                message.reply(trans('model.command.offers.alertsOff'));
            });
        } else {
            member.roles.add(Config.roles.offers).then(() => {
                message.reply(trans('model.command.offers.alertsOn'));
            });
        }
    }
}

module.exports = new Offers();
