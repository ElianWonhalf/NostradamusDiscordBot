const Config = require('../config.json');
const Guild = require('./guild');
const TwitterUtils = require('./twitter-utils');

const REACTION = 'share';
const TWITTER = 'twitter';
const socialMedia = [TWITTER];
const postOn = {};

/**
 * @param {Message} message
 */
postOn[TWITTER] = async (message) => {
    if (Config.socialMedia.twitter.apiKey !== '') {
        TwitterUtils.postMessage(message);
    }
};

const SocialNetworkIntegration = {
    handleMessage: async (message) => {
        const emoji = bot.emojis.find(emoji => emoji.name === REACTION);

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
        if (Guild.isMemberMod(await Guild.discordGuild.fetchMember(user)) && reaction.emoji.name === REACTION) {
            SocialNetworkIntegration.postOnSocialMedia(reaction.message);
        }
    },

    /**
     * @param {Message} message
     */
    postOnSocialMedia: (message) => {
        for (const socialMedium of socialMedia) {
            postOn[socialMedium](message);
        }
    }
};

module.exports = SocialNetworkIntegration;
