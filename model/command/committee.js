const Config = require('../../config.json');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['comitee', 'commitee', 'comittee', 'committe', 'comite', 'comité'],
    category: CommandCategory.INFO,
    isAllowedForContext: CommandPermission.notInWelcome,
    process: async (message) => {
        let list = message.guild.members.cache.filter(
            member => member.roles.cache.has(Config.roles.committee)
        ).map(
            member => member.displayName + '#' + member.user.discriminator
        );

        message.reply(`${trans('model.command.committee.answer', [list.length])}\n\n${list.join('\n')}`);
    }
};
