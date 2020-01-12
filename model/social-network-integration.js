const Config = require('../config.json');
const Guild = require('./guild');

const REACTION = 'alogo';
const TWITTER = 'twitter';
const socialMedia = [TWITTER];
const postOn = {};

/**
 * @param {Message} message
 */
postOn[TWITTER] = (message) => {
    // @TODO, should be easy, lol
    console.log('Post on twitter, yo');
};

const SocialNetworkIntegration = {
    handleMessage: async (message) => {
        if (message.channel.id === Config.channels.starboard && message.author.bot) {
            await message.react(bot.emojis.find(emoji => emoji.name === REACTION));
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
