const Guild = require('../guild');
const Blacklist = require('../blacklist');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

const checkUsername = (member, semiBlacklistTriggered, fullBlacklistTriggered) => {
    const semiWords = Blacklist.getSemiWordsInString(member.user.username);
    const fullWords = Blacklist.getFullWordsInString(member.user.username);
    const formattedUsername = Blacklist.formatWordsInString(member.user.username);

    if (fullWords.length > 0) {
        fullBlacklistTriggered.push(`   ${trans(
            'model.command.auditMembers.username',
            [member.toString(), formattedUsername],
            'en'
        )}`);
    } else if (semiWords.length > 0) {
        semiBlacklistTriggered.push(`   ${trans(
            'model.command.auditMembers.username',
            [member.toString(), formattedUsername],
            'en'
        )}`);
    }
};

const checkNickname = (member, semiBlacklistTriggered, fullBlacklistTriggered) => {
    const hasNickname = member.nickname !== null && member.nickname !== undefined;

    if (hasNickname) {
        const semiWords = Blacklist.getSemiWordsInString(member.nickname);
        const fullWords = Blacklist.getFullWordsInString(member.nickname);
        const formattedNickname = Blacklist.formatWordsInString(member.nickname);

        if (fullWords.length > 0) {
            fullBlacklistTriggered.push(`   ${trans(
                'model.command.auditMembers.nickname',
                [member.toString(), formattedNickname],
                'en'
            )}`);
        } else if (semiWords.length > 0) {
            semiBlacklistTriggered.push(`   ${trans(
                'model.command.auditMembers.nickname',
                [member.toString(), formattedNickname],
                'en'
            )}`);
        }
    }
};

const checkCustomStatus = (member, semiBlacklistTriggered, fullBlacklistTriggered) => {
    const activity = member.presence.activities.find(activity => activity.type === 'CUSTOM_STATUS');
    const hasGame = activity !== undefined;
    const hasCustomStatusSet = hasGame && activity.state;

    if (hasCustomStatusSet) {
        const semiWords = Blacklist.getSemiWordsInString(activity.state);
        const fullWords = Blacklist.getFullWordsInString(activity.state);
        const formattedState = Blacklist.formatWordsInString(activity.state);

        if (fullWords.length > 0) {
            fullBlacklistTriggered.push(`   ${trans(
                'model.command.auditMembers.customStatus',
                [member.toString(), formattedState],
                'en'
            )}`);
        } else if (semiWords.length > 0) {
            semiBlacklistTriggered.push(`   ${trans(
                'model.command.auditMembers.customStatus',
                [member.toString(), formattedState],
                'en'
            )}`);
        }
    }
};

class CheckCustomStatuses
{
    static instance = null;

    constructor() {
        if (CheckCustomStatuses.instance !== null) {
            return CheckCustomStatuses.instance;
        }

        this.aliases = ['auditmembers'];
        this.category = CommandCategory.MODERATION;
        this.isAllowedForContext = CommandPermission.isMemberModOrSoft;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        let semiBlacklistTriggered = [];
        let fullBlacklistTriggered = [];
        let finalMessage = '';

        Guild.discordGuild.members.cache.array().forEach(member => {
            checkUsername(member, semiBlacklistTriggered, fullBlacklistTriggered);
            checkNickname(member, semiBlacklistTriggered, fullBlacklistTriggered);
            checkCustomStatus(member, semiBlacklistTriggered, fullBlacklistTriggered);
        });

        if (semiBlacklistTriggered.length > 0) {
            finalMessage += `**${trans(
                'model.command.auditMembers.semiBlacklistHeading',
                [],
                'en'
            )}**\n${semiBlacklistTriggered.sort().join('\n')}\n\n`;
        }

        if (fullBlacklistTriggered.length > 0) {
            finalMessage += `**${trans(
                'model.command.auditMembers.fullBlacklistHeading',
                [],
                'en'
            )}**\n${fullBlacklistTriggered.sort().join('\n')}\n\n`;
        }

        await message.channel.send(finalMessage, { split: true });
    }
}

module.exports = new CheckCustomStatuses();
