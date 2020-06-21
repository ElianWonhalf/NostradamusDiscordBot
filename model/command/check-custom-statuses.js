const Config = require('../../config.json');
const Guild = require('../guild');
const Blacklist = require('../blacklist');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class CheckCustomStatuses
{
    static instance = null;

    constructor() {
        if (CheckCustomStatuses.instance !== null) {
            return CheckCustomStatuses.instance;
        }

        this.aliases = [];
        this.category = CommandCategory.MODERATION;
        this.isAllowedForContext = CommandPermission.isMemberMod;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        const membersWithCustomStatusCount = Guild.discordGuild.members.cache.filter(member => {
            const activity = member.presence.activities.find(activity => activity.type === 'CUSTOM_STATUS');

            return !member.roles.cache.has(Config.roles.mod)
                && activity !== undefined
                && activity.state !== null;
        }).size;

        let semiBlacklistTriggered = [];
        let fullBlacklistTriggered = [];
        let finalMessage = `${trans(
            'model.command.checkCustomStatuses.introduction',
            [membersWithCustomStatusCount],
            'en'
        )}\n\n`;

        Guild.discordGuild.members.cache.array().forEach(member => {
            const activity = member.presence.activities.find(activity => activity.type === 'CUSTOM_STATUS');
            const hasGame = activity !== undefined;
            const hasCustomStatusSet = hasGame && activity.state !== null;

            if (hasCustomStatusSet) {
                if (Blacklist.isSemiTriggered(activity.state)) {
                    semiBlacklistTriggered.push(`   ${trans(
                        'model.command.checkCustomStatuses.customStatus',
                        [member.toString(), activity.state],
                        'en'
                    )}`);
                }

                if (Blacklist.isFullTriggered(activity.state)) {
                    fullBlacklistTriggered.push(`   ${trans(
                        'model.command.checkCustomStatuses.customStatus',
                        [member.toString(), activity.state],
                        'en'
                    )}`);
                }
            }
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
