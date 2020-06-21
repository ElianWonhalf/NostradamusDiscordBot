const Config = require('../../config.json');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class ModList
{
    static instance = null;

    constructor() {
        if (ModList.instance !== null) {
            return ModList.instance;
        }

        this.aliases = ['modlist', 'mod', 'modo', 'mods', 'modos', 'modérateur', 'modérateurs', 'moderateur', 'moderateurs', 'moderator', 'moderators'];
        this.category = CommandCategory.INFO;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        let list = message.guild.members.cache.filter(
            member => member.roles.cache.has(Config.roles.mod)
        ).map(
            member => member.displayName + '#' + member.user.discriminator
        );

        message.reply(`${trans('model.command.modList.answer', [list.length])}\n\n${list.join('\n')}`);
    }
}

module.exports = new ModList();
