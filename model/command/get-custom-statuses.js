const Logger = require('@elian-wonhalf/pretty-logger');
const Config = require('../../config.json');
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
            let answers = [];
            const membersWithCustomStatus = Guild.discordGuild.members.filter(member => {
                return !member.roles.has(Config.roles.mod)
                    && member.presence.game !== null
                    && member.presence.game.type === 4
                    && member.presence.game.state !== null;
            }).array().map(member => `${member}: ${member.presence.game.state}`);

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
    }
};
