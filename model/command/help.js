const Config = require('../../config.json');
const Guild = require('../guild');
const CommandCategory = require('../command-category');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: [],
    category: CommandCategory.INFO,
    process: async (message) => {
        if (message.guild === null || message.channel.id !== Config.channels.welcome) {
            return;
        }

        const member = await Guild.getMemberFromMessage(message);

        if (!member.roles.has(Config.roles.officialMember)) {
            Guild.botChannel.send(
                trans('model.command.help.notice', [member, `<#${Config.channels.welcome}>`, message.url], 'en')
            );
        }
    }
};
