const Config = require('../../config.json');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class Committee
{
    static instance = null;

    constructor() {
        if (Committee.instance !== null) {
            return Committee.instance;
        }

        this.aliases = ['comitee', 'commitee', 'comittee', 'committe', 'comite', 'comité'];
        this.category = CommandCategory.INFO;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        let list = message.guild.members.cache.filter(
            member => member.roles.cache.has(Config.roles.committee)
        ).map(
            member => member.displayName + '#' + member.user.discriminator
        );

        message.reply(`${trans('model.command.committee.answer', [list.length])}\n\n${list.join('\n')}`);
    }
}

module.exports = new Committee();
