const Config = require('../../config.json');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: [],
    category: CommandCategory.MODERATION,
    isAllowedForContext: CommandPermission.isMemberMod,
    process: async (message) => {
        let answers = [];
        const membersWithCustomStatus = Guild.discordGuild.members.cache.filter(member => {
            const activity = member.presence.activities.find(activity => activity.type === 'CUSTOM_STATUS');

            return !member.roles.cache.has(Config.roles.mod)
                && activity !== undefined
                && activity.state !== null;
        }).array().map(member => {
            const activity = member.presence.activities.find(activity => activity.type === 'CUSTOM_STATUS');

            return `${member}: ${activity.state}`
        });

        membersWithCustomStatus.forEach(status => {
            let foundKey = false;

            answers = answers.map(answer => {
                if (!foundKey && answer.length + status.length < 1850) {
                    foundKey = true;
                    answer = `${answer}\n${status}`;
                }

                return answer;
            });

            if (!foundKey) {
                answers.push(status);
            }
        });

        message.channel.send(`${trans(
            'model.command.getCustomStatuses.introduction',
            [membersWithCustomStatus.length],
            'en'
        )}`);

        answers.forEach(answer => {
            message.channel.send(answer);
        });
    }
};
