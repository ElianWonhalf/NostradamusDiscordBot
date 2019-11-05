const Logger = require('@elian-wonhalf/pretty-logger');
const got = require('got');
const GoogleTranslateToken = require('./google-translate-token');
const Config = require('../config.json');
const Guild = require('./guild');

const GOOGLE_TRANSLATE_URL = 'https://translate.google.com/translate_a/single?client=webapp&sl=auto&tl=en&ie=UTF-8&oe=UTF-8&dt=gt&ssel=0&tsel=0&kc=1&';
const MAX_WRONG_LANGUAGE_MESSAGES_BEFORE_WARNING = 7;
const RIGHT_LANGUAGES_MESSAGES_BEFORE_RESET = 4;
const MINIMUM_CHARACTERS_TO_TRANSLATE = 10;

/**
 * @param {Snowflake} channelId
 */
const resetChannel = (channelId) => {
    if (HardcoreLearning.wrongLanguageCounter.hasOwnProperty(channelId)) {
        HardcoreLearning.wrongLanguageCounter[channelId] = 0;
        HardcoreLearning.rightLanguageCounter[channelId] = 0;
        HardcoreLearning.alreadyWarned[channelId] = false;
    }
};

const HardcoreLearning = {
    rightLanguageCounter: {},
    wrongLanguageCounter: {},
    alreadyWarned: {},

    /**
     * @param {Message} message
     */
    addMessage: async (message) => {
        const content = message.cleanContent.replace(/\s?<:[^:]+:\d+>/g, '');

        if (content.length < MINIMUM_CHARACTERS_TO_TRANSLATE) {
            return;
        }

        const tk = await GoogleTranslateToken.get(content);
        const url = `${GOOGLE_TRANSLATE_URL}q=${encodeURIComponent(content)}&tk=${tk.value}`;

        if (!HardcoreLearning.wrongLanguageCounter.hasOwnProperty(message.channel.id)) {
            HardcoreLearning.wrongLanguageCounter[message.channel.id] = 0;
            HardcoreLearning.rightLanguageCounter[message.channel.id] = 0;
            HardcoreLearning.alreadyWarned[message.channel.id] = false;
        }

        got(url, {json: true}).then(result => {
            if (result.body !== null) {
                let lastMessageWasRight;

                if (result.body[2] === Config.learntLanguagePrefix) {
                    if (HardcoreLearning.alreadyWarned[message.channel.id]) {
                        HardcoreLearning.rightLanguageCounter[message.channel.id]++;
                    }

                    lastMessageWasRight = true;
                } else {
                    HardcoreLearning.wrongLanguageCounter[message.channel.id]++;

                    lastMessageWasRight = false;
                }

                debug(`lastMessageWasRight: ${lastMessageWasRight ? 'true' : 'false'} (detected: ${result.body[2]})`);
                HardcoreLearning.watchCounters(message, lastMessageWasRight);
            }
        }).catch(Logger.exception);
    },

    /**
     * @param {Message} message
     * @param {boolean} lastMessageWasRight
     */
    watchCounters: (message, lastMessageWasRight) => {
        if (HardcoreLearning.wrongLanguageCounter[message.channel.id] < MAX_WRONG_LANGUAGE_MESSAGES_BEFORE_WARNING) {
            if (lastMessageWasRight) {
                HardcoreLearning.wrongLanguageCounter[message.channel.id]--;

                if (HardcoreLearning.wrongLanguageCounter[message.channel.id] < 0) {
                    HardcoreLearning.wrongLanguageCounter[message.channel.id] = 0;
                }
            }

            debug(`Not enough wrong messages to warn *yet*. (${HardcoreLearning.wrongLanguageCounter[message.channel.id]} / ${MAX_WRONG_LANGUAGE_MESSAGES_BEFORE_WARNING})`);
            return;
        }

        if (!HardcoreLearning.alreadyWarned[message.channel.id]) {
            message.channel.send(
                trans('model.hardcoreLearning.warning', [`%${Config.learntLanguage}%`, `%${Config.learntLanguage}%`])
            );
            HardcoreLearning.alreadyWarned[message.channel.id] = true;
        } else if (!lastMessageWasRight) {
            const emoji = bot.emojis.find(emoji => emoji.name === 'roocop');
            message.react(emoji);
        }

        if (HardcoreLearning.rightLanguageCounter[message.channel.id] >= RIGHT_LANGUAGES_MESSAGES_BEFORE_RESET) {
            HardcoreLearning.reset(message.channel);
        }
    },

    /**
     * @param {TextChannel} [channel]
     */
    reset: (channel) => {
        if (channel === undefined){
            debug('Happy reset!');

            for (let channelId in HardcoreLearning.wrongLanguageCounter) {
                resetChannel(channelId);
            }
        } else {
            debug(`Happy reset for channel ${channel.name}`);
            resetChannel(channel.id);
        }
    }
};

module.exports = HardcoreLearning;