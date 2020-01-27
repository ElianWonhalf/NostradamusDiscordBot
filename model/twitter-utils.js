const Twit = require('twit');
const Logger = require('@elian-wonhalf/pretty-logger');
const Config = require('../config.json');
const Guild = require('./guild');
const MAX_CHAR_COUNT = 280;

let T = null;

if (Config.socialMedia.twitter.apiKey !== '') {
    T = new Twit({
        consumer_key: Config.socialMedia.twitter.apiKey,
        consumer_secret: Config.socialMedia.twitter.apiSecretKey,
        access_token: Config.socialMedia.twitter.accessToken,
        access_token_secret: Config.socialMedia.twitter.accessTokenSecret
    });
}

const TwitterUtils = {
    postMessage: async (message) => {
        if (Config.socialMedia.twitter.apiKey !== '') {
            const member = await Guild.getMemberFromMessage(message);
            const messageLength = MAX_CHAR_COUNT - member.displayName.length - 45;
            const truncatedMessage = message.cleanContent.substr(0, messageLength);
            const status = member.displayName + ' sur Discord :\n'
                + truncatedMessage + (truncatedMessage.length !== message.cleanContent.length ? '...' : '')
                + '\n\nhttps://discord.gg/french';

            Logger.info('Publishing post on Twitter...');

            T.post(
                'statuses/update',
                {status: status}
            ).then(async () => {
                Logger.info('✅ Successfully published on Twitter!');
                await message.react(bot.emojis.find(emoji => emoji.name === 'pollyes'));
            }).catch(async error => {
                Logger.error(error.body);
                await message.react(bot.emojis.find(emoji => emoji.name === 'pollno'));
            });
        }
    }
};

module.exports = TwitterUtils;
