const Config = require('../../config.json');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class LinguistList
{
    static instance = null;

    constructor() {
        if (LinguistList.instance !== null) {
            return LinguistList.instance;
        }

        this.aliases = [
            'linguistlist',
            'linguist',
            'linguists'
        ];

        this.category = CommandCategory.INFO;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        let list = message.guild.members.cache.filter(
            member => member.roles.cache.has(Config.roles.linguist)
        ).map(
            member => member.displayName + '#' + member.user.discriminator
        );

        message.reply(`${trans('model.command.linguistList.answer', [list.length])}\n\n${list.join('\n')}`);
    }
}

module.exports = new LinguistList();
