const Config = require('../../config.json');
const Guild = require('../guild');
const MemberRolesFlow = require('../member-roles-flow');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: [],
    process: async (message) => {
        if (message.guild === null || message.channel.id !== Config.channels.welcome) {
            return;
        }

        const member = message.member;

        if (!member.roles.has(Config.roles.officialMember)) {
            Guild.botChannel.send(
                trans('model.command.help.notice', [member, `<#${Config.channels.welcome}>`, message.url], 'en')
            );
            MemberRolesFlow.answerWithNextStep(message, member);
        }
    }
};
