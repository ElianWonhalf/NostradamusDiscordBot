const Logger = require('@lilywonhalf/pretty-logger');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class Report
{
    static instance = null;

    constructor() {
        if (Report.instance !== null) {
            return Report.instance;
        }

        this.aliases = ['rp', 'rep'];
        this.category = CommandCategory.MODERATION;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
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
}

module.exports = new Report();
