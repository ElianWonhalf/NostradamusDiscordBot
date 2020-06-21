const Config = require('../../config.json');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class Tutors
{
    static instance = null;

    constructor() {
        if (Tutors.instance !== null) {
            return Tutors.instance;
        }

        this.aliases = ['tuteur', 'tuteurs', 'tutor'];
        this.category = CommandCategory.INFO;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        let list = message.guild.members.cache.filter(
            member => member.roles.cache.has(Config.roles.tutor)
        ).map(
            member => member.displayName + '#' + member.user.discriminator
        );

        message.reply(`${trans('model.command.tutors.answer', [list.length])}\n\n${list.join('\n')}`);
    }
}

module.exports = new Tutors();
