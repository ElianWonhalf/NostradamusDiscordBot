const Config = require('../../config.json');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class AdminList
{
    static instance = null;

    constructor() {
        if (AdminList.instance !== null) {
            return AdminList.instance;
        }

        this.aliases = [
            'adminlist',
            'admin',
            'admin',
            'admins',
            'administrateur',
            'administrateurs',
            'administrator',
            'administrators'
        ];

        this.category = CommandCategory.INFO;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        let list = message.guild.members.cache.filter(
            member => member.roles.cache.has(Config.roles.admin)
        ).map(
            member => member.displayName + '#' + member.user.discriminator
        );

        message.reply(`${trans('model.command.adminList.answer', [list.length])}\n\n${list.join('\n')}`);
    }
}

module.exports = new AdminList();
