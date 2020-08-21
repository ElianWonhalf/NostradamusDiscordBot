const Config = require('../../config.json');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class WarnTroll
{
    static instance = null;

    constructor() {
        if (WarnTroll.instance !== null) {
            return WarnTroll.instance;
        }

        this.aliases = [];
        this.category = CommandCategory.MODERATION;
        this.isAllowedForContext = CommandPermission.isMemberModOrSoft;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        let {certain, foundMembers} = Guild.findDesignatedMemberInMessage(message);
        let certaintySentence;
        let answer;
        let userId = 'ID';
        let warnMessageEn = trans('model.command.warntroll.warnMessage', [Guild.discordGuild.name], 'en');
        let warnMessageFr = trans('model.command.warntroll.warnMessage', [Guild.discordGuild.name], 'fr');

        if (foundMembers.length > 0) {
            if (!certain) {
                certaintySentence = trans('model.command.warntroll.memberGuessed', [foundMembers[0]], 'en');
            }

            userId = foundMembers[0].user.id;
        } else {
            certaintySentence = trans('model.command.warntroll.memberNotGuessed', [], 'en');
        }

        answer = trans('model.command.warntroll.answer', [certaintySentence], 'en');
        answer += `\`\`\`${Config.warnCommand.replace('%id', userId).replace('%reason', warnMessageEn)}\`\`\``;
        answer += `\`\`\`${Config.warnCommand.replace('%id', userId).replace('%reason', warnMessageFr)}\`\`\``;

        message.reply(answer);
    }
}

module.exports = new WarnTroll();
