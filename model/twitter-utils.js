const Twit = require('twit');
const got = require('got');
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
    /**
     * @param {Message} message
     * @param {String} content
     * @param {String} image
     * @returns {Promise.<void>}
     */
    postMessage: async (message, content, image) => {
        if (Config.socialMedia.twitter.apiKey !== '') {
            image = image || null;

            const member = await Guild.getMemberFromMessage(message);
            const messageLength = MAX_CHAR_COUNT - member.displayName.length - 45;
            const truncatedMessage = content.substr(0, messageLength);
            const status = member.displayName + ' sur Discord :\n'
                + truncatedMessage + (truncatedMessage.length !== content.length ? '...' : '')
                + '\n\nhttps://discord.gg/french';

            Logger.info('Publishing post on Twitter...');

            const postPromise = image === null
                ? TwitterUtils.postTextStatus(status)
                : TwitterUtils.postImageStatus(status, image);

            postPromise.then(async () => {
                Logger.info('✅ Successfully published on Twitter!');
                await message.react(bot.emojis.find(emoji => emoji.name === 'pollyes'));
            }).catch(async error => {
                Logger.exception(error);
                await message.react(bot.emojis.find(emoji => emoji.name === 'pollno'));
            });
        }
    },

    postTextStatus: (content) => {
        return T.post(
            'statuses/update',
            {status: content}
        );
    },

    /**
     * @param {String} content
     * @param {String} image
     * @returns {Promise.<void>}
     */
    postImageStatus: (content, image) => {
        return new Promise(async (resolve, reject) => {
            const response = await got(image, {responseType: 'buffer', encoding: null});
            const imageBase64 = response.body.toString('base64');

            // First we must post the media to Twitter
            T.post('media/upload', {media_data: imageBase64}, function (err, data) {
                if (!err) { // Can't have a strict comparison here 😿
                    const mediaIdStr = data.media_id_string;
                    const params = {status: content, media_ids: [mediaIdStr]};

                    T.post('statuses/update', params).then(resolve).catch(reject);
                } else {
                    reject(err);
                }
            });
        });
    }
};

module.exports = TwitterUtils;
