const Config = require('../config.json');
const Guild = require('./guild');
const TwitterUtils = require('./twitter-utils');

const REACTION = 'share';
const TWITTER = 'twitter';
const socialMedia = [TWITTER];
const postOn = {};

/**
 * @param {Message} message
 * @param {String} authorName
 * @param {String} content
 * @param {String} image
 */
postOn[TWITTER] = async (message, authorName, content, image) => {
    if (Config.socialMedia.twitter.apiKey !== '') {
        TwitterUtils.postMessage(message, authorName, content, image);
    }
};

const SocialNetworkIntegration = {
    handleMessage: async (message) => {
        const emoji = bot.emojis.cache.find(emoji => emoji.name === REACTION);

        if (message.channel.id === Config.channels.starboard && message.author.bot) {
            await message.react(emoji);
        } else if (message.channel.id === Config.channels.announcements) {
            await message.react(emoji);
        }
    },

    /**
     * @param {MessageReaction} reaction
     * @param {User} user
     */
    handleReaction: async (reaction, user) => {
        if (Guild.isMemberMod(await Guild.discordGuild.members.fetch(user)) && reaction.emoji.name === REACTION) {
            const modReactions = reaction.users.cache.filter(
                async user => Guild.isMemberMod(await Guild.discordGuild.members.fetch(user))
            ).size;

            if (modReactions < 2) {
                SocialNetworkIntegration.postOnSocialMedia(reaction.message);
            }
        }
    },

    /**
     * @param {Message} message
     */
    postOnSocialMedia: (message) => {
        let authorName = message.member.displayName;
        let content = message.cleanContent;
        let images = message.attachments.array()
            .filter(attachment => attachment.width !== null)
            .map(attachment => attachment.url);

        if (message.channel.id === Config.channels.starboard) {
            const embed = message.embeds[0];

            authorName = embed.author.name;
            content = embed.description;
            images = embed.image !== null ? embed.image.url : null;
        }

        const image = images.length > 0 ? images[0] : null;

        for (const socialMedium of socialMedia) {
            postOn[socialMedium](message, authorName, content, image);
        }
    }
};

module.exports = SocialNetworkIntegration;
