const Discord = require('discord.js');
const MessageReactionAdd = require('./messageReactionAdd');
const Starboard = require('../../model/starboard');

/**
 * @param {object} data
 */
module.exports = async (data) => {
    let channel, message, inCache;

    switch (data.t) {
        case Discord.Constants.WSEvents.MESSAGE_REACTION_ADD:
            channel = await bot.channels.fetch(data.d.channel_id);
            inCache = channel.messages.cache.has(data.d.message_id);
            message = await channel.messages.fetch(data.d.message_id);

            // If the message isn't cached, the event won't be emitted by the lib, so we emit it.
            if (!inCache) {
                const reactionData = {
                    me: data.d.user_id === bot.user.id,
                    emoji: data.d.emoji,
                    count: 0
                };

                const reaction = new Discord.MessageReaction(bot, reactionData, message);
                const user = await bot.users.fetch(data.d.user_id);

                await MessageReactionAdd(reaction, user);
            }

            break;

        case Discord.Constants.WSEvents.MESSAGE_DELETE:
            if (isRightGuild(data.d.guild_id)) {
                const messageId = data.d.id;

                await Starboard.messageDeletedHandler(messageId);
            }

            break;
    }
};
