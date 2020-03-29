const Logger = require('@elian-wonhalf/pretty-logger');
const Discord = require('discord.js');
const Guild = require('../guild');
const CommandCategory = require('../command-category');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: [],
    category: CommandCategory.BOT_MANAGEMENT,
    process: async (message, content) => {
        const member = await Guild.getMemberFromMessage(message);

        if (Guild.isMemberMod(member)) {
            let member = await Guild.getMemberFromMessage(message);

            if (message.mentions.members.size > 0) {
                member = message.mentions.members.first();
                content.shift();
            }

            const embed = new Discord.MessageEmbed()
                .setAuthor(
                    `${member.displayName}`,
                    member.user.displayAvatarURL
                )
                .setColor(0x00FF00)
                .setDescription(content.join(' '));

            message.channel.send(embed).then(async () => {
                await message.delete();
            }).catch(async (error) => {
                Logger.error(error.toString());
                await message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollno'));
            });
        }
    }
};
