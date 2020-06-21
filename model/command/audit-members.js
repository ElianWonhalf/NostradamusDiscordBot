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
            'model.command.checkCustomStatuses.username',
            [member.toString(), formattedUsername],
            'en'
        )}`);
    } else if (semiWords.length > 0) {
        fullBlacklistTriggered.push(`   ${trans(
            'model.command.checkCustomStatuses.username',
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
                'model.command.checkCustomStatuses.nickname',
                [member.toString(), formattedNickname],
                'en'
            )}`);
        } else if (semiWords.length > 0) {
            fullBlacklistTriggered.push(`   ${trans(
                'model.command.checkCustomStatuses.nickname',
                [member.toString(), formattedNickname],
                'en'
            )}`);
        }
    }
};

const checkCustomStatus = (member, semiBlacklistTriggered, fullBlacklistTriggered) => {
    const activity = member.presence.activities.find(activity => activity.type === 'CUSTOM_STATUS');
    const hasGame = activity !== undefined;
    const hasCustomStatusSet = hasGame && activity.state !== null;

    if (hasCustomStatusSet) {
        const semiWords = Blacklist.getSemiWordsInString(activity.state);
        const fullWords = Blacklist.getFullWordsInString(activity.state);
        const formattedState = Blacklist.formatWordsInString(activity.state);

        if (fullWords.length > 0) {
            fullBlacklistTriggered.push(`   ${trans(
                'model.command.checkCustomStatuses.customStatus',
                [member.toString(), formattedState],
                'en'
            )}`);
        } else if (semiWords.length > 0) {
            semiBlacklistTriggered.push(`   ${trans(
                'model.command.checkCustomStatuses.customStatus',
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
        this.isAllowedForContext = CommandPermission.isMemberMod;
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
                'model.command.checkCustomStatuses.semiBlacklistHeading',
                [],
                'en'
            )}**\n${semiBlacklistTriggered.join('\n')}\n\n`;
        }

        if (fullBlacklistTriggered.length > 0) {
            finalMessage += `**${trans(
                'model.command.checkCustomStatuses.fullBlacklistHeading',
                [],
                'en'
            )}**\n${fullBlacklistTriggered.join('\n')}\n\n`;
        }

        message.channel.send(finalMessage);
    }
}

module.exports = new CheckCustomStatuses();
