const Config = require('../../config.json');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class Events
{
    static instance = null;

    constructor() {
        if (Events.instance !== null) {
            return Events.instance;
        }

        this.aliases = [
            'ev',
            'event',
            'events',
            'évènements',
            'évènement',
            'événements',
            'événement',
            'évenements',
            'évenement',
            'evénements',
            'evénement',
            'evenements',
            'evenement',
        ];
        this.category = CommandCategory.ROLE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        const member = await Guild.getMemberFromMessage(message);

        if (member.roles.cache.has(Config.roles.events)) {
            member.roles.remove(Config.roles.events).then(() => {
                message.reply(trans('model.command.events.alertsOff'));
            });
        } else {
            member.roles.add(Config.roles.events).then(() => {
                message.reply(trans('model.command.events.alertsOn'));
            });
        }
    }
}

module.exports = new Events();
