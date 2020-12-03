const Config = require('../../config.json');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class AnimatorList
{
    static instance = null;

    constructor() {
        if (AnimatorList.instance !== null) {
            return AnimatorList.instance;
        }

        this.aliases = [
            'animatorlist',
            'animator',
            'animators',
            'animateur',
            'animateurs'
        ];

        this.category = CommandCategory.INFO;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        let list = message.guild.members.cache.filter(
            member => member.roles.cache.has(Config.roles.animator)
        ).map(
            member => member.displayName + '#' + member.user.discriminator
        );

        message.reply(`${trans('model.command.animatorList.answer', [list.length])}\n\n${list.join('\n')}`);
    }
}

module.exports = new AnimatorList();
