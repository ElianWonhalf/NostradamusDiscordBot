const { MessageAttachment } = require('discord.js');
const Config = require('../config.json');
const db = require('./db');
const Guild = require('./guild');

const Starboard = {
    MIN_NB_STARS: 7,
    IGNORED_CHANNELS: [
        Config.channels.selfie,
        Config.channels.starboard
    ],

    /**
     * @param {string} messageId
     * @param {string} starboardMessageId
     * @returns {Promise}
     */
    add: async (messageId, starboardMessageId) => {
        await db.asyncQuery('SET NAMES utf8mb4');

        return db.asyncQuery(
            `INSERT INTO starboard_message (message_id, starboard_message_id) VALUES (?, ?)`,
            [messageId, starboardMessageId]
        );
    },

    /**
     * @param {Message} starboardMessage
     */
    delete: async (starboardMessage) => {
        await db.asyncQuery('SET NAMES utf8mb4');
        await db.asyncQuery(
            `DELETE FROM starboard_message WHERE starboard_message_id = ?`,
            [starboardMessage.id]
        );
        await starboardMessage.delete();
    },

    /**
     * @param {string} messageId
     * @returns {Promise<{ message_id: string, starboard_message_id: string }>}
     */
    get: async (messageId) => {
        const rows = await db.asyncQuery(`SELECT * FROM starboard_message WHERE message_id = ?`, [messageId]);
        return rows[0];
    },

    /**
     * @param {string} messageId
     * @returns {Promise<null|Message>}
     */
    getStarboardMessage: async (messageId) => {
        const starboardData = await Starboard.get(messageId);
        let starboardMessage = null;

        if (starboardData) {
            starboardMessage = await Guild.starboardChannel.messages.fetch(starboardData.starboard_message_id);
        }

        return starboardMessage;
    },

    /**
     * @param {string} messageId
     */
    messageDeletedHandler: async (messageId) => {
        const starboardMessage = await Starboard.getStarboardMessage(messageId);

        if (starboardMessage) {
            await Starboard.delete(starboardMessage);
        }
    },

    /**
     * @param {Message} message
     */
    postMessageToStarboard: async (message) => {
        const embed = await Guild.messageToEmbed(message);

        embed.setDescription(`${embed.description}\n\n[Message 👀](${message.url})`);
        embed.setTimestamp(message.createdTimestamp);

        const starboardMessage = await Guild.starboardChannel.send(
            `⭐ ${message.channel.toString()}`,
            {
                embed,
                files: message.attachments.map(messageAttachment => {
                    return new MessageAttachment(messageAttachment.url, messageAttachment.filename);
                })
            }
        );

        await Starboard.add(message.id, starboardMessage.id);
    },

    /**
     * @param {MessageReaction} reaction
     */
    handleReaction: async (reaction) => {
        if (reaction.emoji.name === '⭐' && !Starboard.IGNORED_CHANNELS.includes(reaction.message.channel.id)) {
            const message = reaction.message;
            const starboardMessage = await Starboard.getStarboardMessage(message.id);
            const starReactions = message.reactions.cache.find(reaction => reaction.emoji.name === '⭐');

            if (starReactions && starReactions.count >= Starboard.MIN_NB_STARS) {
                if (!starboardMessage) {
                    await Starboard.postMessageToStarboard(message);
                }
            } else {
                if (starboardMessage) {
                    await Starboard.delete(starboardMessage);
                }
            }
        }
    }
};

module.exports = Starboard;
