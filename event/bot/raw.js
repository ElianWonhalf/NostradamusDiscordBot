const Discord = require('discord.js');
const MessageReactionAdd = require('./messageReactionAdd');

/**
 * @param {object} data
 */
module.exports = async (data) => {
    if (data.t === Discord.Constants.WSEvents.MESSAGE_REACTION_ADD) {
        const reactionData = {
            me: data.d.user_id === bot.user.id,
            emoji: data.d.emoji,
            count: 0
        };

        const channel = await bot.channels.fetch(data.d.channel_id);
        const inCache = channel.messages.cache.has(data.d.message_id);
        const message = await channel.messages.fetch(data.d.message_id);

        // If the message isn't cached, the event won't be emitted by the lib, so we emit it.
        if (!inCache) {
            const reaction = new Discord.MessageReaction(bot, reactionData, message);
            const user = await bot.users.fetch(data.d.user_id);

            MessageReactionAdd(reaction, user);
        }
    }
};
