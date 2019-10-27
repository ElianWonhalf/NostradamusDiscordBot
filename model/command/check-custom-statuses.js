const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../guild');
const Blacklist = require('../blacklist');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: [],
    process: async (message) => {
        const member = await Guild.getMemberFromMessage(message);

        if (Guild.isMemberMod(member)) {
            const membersWithCustomStatusCount = Guild.discordGuild.members.filter(member => {
                return member.presence.game !== null && member.presence.game.type === 4;
            }).size;
            let semiBlacklistTriggered = [];
            let fullBlacklistTriggered = [];
            let finalMessage = `${trans(
                'model.command.checkCustomStatuses.introduction',
                [membersWithCustomStatusCount],
                'en'
            )}\n\n`;

            Guild.discordGuild.members.array().forEach(member => {
                const hasGame = member.presence.game !== null;
                const hasCustomStatusSet = hasGame && member.presence.game.type === 4;
                const hasCustomStatus = hasCustomStatusSet && member.presence.game.state !== null;

                if (hasCustomStatus) {
                    if (Blacklist.isSemiTriggered(member.presence.game.state)) {
                        semiBlacklistTriggered.push(`   ${trans(
                            'model.command.checkCustomStatuses.customStatus',
                            [member.toString(), member.presence.game.state],
                            'en'
                        )}`);
                    }

                    if (Blacklist.isFullTriggered(member.presence.game.state)) {
                        fullBlacklistTriggered.push(`   ${trans(
                            'model.command.checkCustomStatuses.customStatus',
                            [member.toString(), member.presence.game.state],
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
};
