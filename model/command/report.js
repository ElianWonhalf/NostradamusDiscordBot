const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: ['rp', 'rep'],
    process: async (message) => {
        if (message.guild === null) {
            message.reply(trans('model.command.report.onlyOnServer'));
            return;
        }

        message.delete().catch(Logger.exception);
        const member = await Guild.getMemberFromMessage(message);
        let {certain, foundMembers} = Guild.findDesignatedMemberInMessage(message);

        foundMembers = foundMembers
            .map(member => `${member} (\`${member.user.username}#${member.user.discriminator}\`${member.nickname !== null ? ` aka \`${member.nickname}\`` : ``})`)
            .join(', ');

        const certaintySentence = certain ? trans('model.command.report.reportedMembersCertain', [foundMembers], 'en') : (foundMembers.length > 0 ? trans('model.command.report.reportedMembersGuessed', [foundMembers], 'en') : ``);

        Guild.automodChannel.send(
            trans('model.command.report.report', [member, certaintySentence, message.url], 'en'),
            await Guild.messageToEmbed(message)
        );
    }
};
