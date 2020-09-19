const Logger = require('@lilywonhalf/pretty-logger');
const got = require('got');
const GoogleTranslateToken = require('./google-translate-token');
const Config = require('../config.json');

const GOOGLE_TRANSLATE_URL = 'https://translate.google.com/translate_a/single?client=webapp&sl=auto&tl=en&ie=UTF-8&oe=UTF-8&dt=gt&ssel=0&tsel=0&kc=1&';
const MAX_WRONG_LANGUAGE_MESSAGES_BEFORE_WARNING = 14;
const RIGHT_LANGUAGES_MESSAGES_BEFORE_RESET = 4;
const MINIMUM_CHARACTERS_TO_TRANSLATE = 10;

const LANGUAGES_THAT_IN_FACT_ARE_FR = [
    'co'
];

/**
 * @param {Snowflake} channelId
 */
const resetChannel = (channelId) => {
    if (HardcoreOtherLanguages.wrongLanguageCounter.hasOwnProperty(channelId)) {
        HardcoreOtherLanguages.wrongLanguageCounter[channelId] = 0;
        HardcoreOtherLanguages.rightLanguageCounter[channelId] = 0;
        HardcoreOtherLanguages.alreadyWarned[channelId] = false;
    }
};

const HardcoreOtherLanguages = {
    rightLanguageCounter: {},
    wrongLanguageCounter: {},
    alreadyWarned: {},

    /**
     * @param {Message} message
     */
    messageHandler: async (message) => {
        if (message.channel.id !== Config.channels.otherLanguages) {
            return;
        }

        const content = message.cleanContent.replace(/\s?<:[^:]+:\d+>/g, '');

        if (content.length < MINIMUM_CHARACTERS_TO_TRANSLATE) {
            return;
        }

        const tk = await GoogleTranslateToken.get(content);
        const url = `${GOOGLE_TRANSLATE_URL}q=${encodeURIComponent(content)}&tk=${tk}`;

        if (!HardcoreOtherLanguages.wrongLanguageCounter.hasOwnProperty(message.channel.id)) {
            HardcoreOtherLanguages.wrongLanguageCounter[message.channel.id] = 0;
            HardcoreOtherLanguages.rightLanguageCounter[message.channel.id] = 0;
            HardcoreOtherLanguages.alreadyWarned[message.channel.id] = false;
        }

        got(url, {json: true}).then(result => {
            if (result.body !== null) {
                let lastMessageWasRight;
                let detectedLanguage = result.body[2];

                if (LANGUAGES_THAT_IN_FACT_ARE_FR.indexOf(detectedLanguage) > -1) {
                    detectedLanguage = 'fr';
                }

                if (![Config.learntLanguagePrefix, Config.otherLanguagePrefix].includes(detectedLanguage)) {
                    if (HardcoreOtherLanguages.alreadyWarned[message.channel.id]) {
                        HardcoreOtherLanguages.rightLanguageCounter[message.channel.id]++;
                    }

                    lastMessageWasRight = true;
                } else {
                    HardcoreOtherLanguages.wrongLanguageCounter[message.channel.id]++;

                    lastMessageWasRight = false;
                }

                if (!lastMessageWasRight) {
                    debug(`Other languages | lastMessageWasRight: false (detected: ${detectedLanguage})`);
                }

                HardcoreOtherLanguages.watchCounters(message, lastMessageWasRight);
            }
        }).catch(Logger.exception);
    },

    /**
     * @param {Message} message
     * @param {boolean} lastMessageWasRight
     */
    watchCounters: (message, lastMessageWasRight) => {
        if (HardcoreOtherLanguages.wrongLanguageCounter[message.channel.id] < MAX_WRONG_LANGUAGE_MESSAGES_BEFORE_WARNING) {
            if (lastMessageWasRight) {
                HardcoreOtherLanguages.wrongLanguageCounter[message.channel.id]--;

                if (HardcoreOtherLanguages.wrongLanguageCounter[message.channel.id] < 0) {
                    HardcoreOtherLanguages.wrongLanguageCounter[message.channel.id] = 0;
                }
            }

            if (!lastMessageWasRight) {
                debug(`Other languages | Not enough wrong messages to warn *yet*. (${HardcoreOtherLanguages.wrongLanguageCounter[message.channel.id]} / ${MAX_WRONG_LANGUAGE_MESSAGES_BEFORE_WARNING})`);
            }

            return;
        }

        const alreadyWarned = HardcoreOtherLanguages.alreadyWarned[message.channel.id];
        const rightLanguageCounter = HardcoreOtherLanguages.rightLanguageCounter[message.channel.id];
        const wrongLanguageCounter = HardcoreOtherLanguages.wrongLanguageCounter[message.channel.id];

        if (!alreadyWarned) {
            message.channel.send(
                trans('model.hardcoreOtherLanguages.warning')
            );
            HardcoreOtherLanguages.alreadyWarned[message.channel.id] = true;
        } else if (!lastMessageWasRight) {
            const emoji = bot.emojis.cache.find(emoji => emoji.name === 'roocop');
            message.react(emoji);

            if (wrongLanguageCounter > MAX_WRONG_LANGUAGE_MESSAGES_BEFORE_WARNING + 7) {
                message.channel.send(trans('model.hardcoreOtherLanguages.secondWarning'));
            }
        }

        if (rightLanguageCounter >= RIGHT_LANGUAGES_MESSAGES_BEFORE_RESET) {
            const emoji = bot.emojis.cache.find(emoji => emoji.name === 'blobpats');

            message.react(emoji);
            HardcoreOtherLanguages.reset(message.channel);
        }
    },

    /**
     * @param {TextChannel} [channel]
     */
    reset: (channel) => {
        if (channel === undefined){
            debug('Other languages | Happy reset!');

            for (let channelId in HardcoreOtherLanguages.wrongLanguageCounter) {
                resetChannel(channelId);
            }
        } else {
            debug(`Other languages | Happy reset for channel ${channel.name}`);
            resetChannel(channel.id);
        }
    }
};

module.exports = HardcoreOtherLanguages;