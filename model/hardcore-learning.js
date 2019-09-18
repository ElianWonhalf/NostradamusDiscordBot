const Logger = require('@elian-wonhalf/pretty-logger');
const got = require('got');
const GoogleTranslateToken = require('./google-translate-token');
const Config = require('../config.json');
const Guild = require('./guild');

const GOOGLE_TRANSLATE_URL = 'https://translate.google.com/translate_a/t?client=webapp&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&dt=at&ie=UTF-8&oe=UTF-8&otf=2&ssel=0&tsel=0&kc=1&sl=auto&tl=en&';
const MAX_WRONG_LANGUAGE_MESSAGES_BEFORE_WARNING = 7;
const RIGHT_LANGUAGES_MESSAGES_BEFORE_RESET = 5;
const MINIMUM_CHARACTERS_TO_TRANSLATE = 10;

const HardcoreLearning = {
    rightLanguageCounter: 0,
    wrongLanguageCounter: 0,
    alreadyWarned: false,

    /**
     * @param {Message} message
     */
    addMessage: async (message) => {
        const content = message.cleanContent;

        if (content.length < MINIMUM_CHARACTERS_TO_TRANSLATE) {
            return;
        }

        const tk = await GoogleTranslateToken.get(content);
        const url = `${GOOGLE_TRANSLATE_URL}q=${encodeURIComponent(content)}&tk=${tk.value}`;

        got(url, {json: true}).then(result => {
            if (result.body !== null) {
                let lastMessageWasRight;

                if (result.body[1] === Config.learntLanguagePrefix) {
                    if (HardcoreLearning.alreadyWarned) {
                        HardcoreLearning.rightLanguageCounter++;
                    }

                    lastMessageWasRight = true;
                } else {
                    HardcoreLearning.wrongLanguageCounter++;

                    lastMessageWasRight = false;
                }

                debug(`lastMessageWasRight: ${lastMessageWasRight ? 'true' : 'false'}`);
                HardcoreLearning.watchCounters(message, lastMessageWasRight);
            }
        }).catch(Logger.exception);
    },

    /**
     * @param {Message} message
     * @param {boolean} lastMessageWasRight
     */
    watchCounters: (message, lastMessageWasRight) => {
        if (HardcoreLearning.wrongLanguageCounter < MAX_WRONG_LANGUAGE_MESSAGES_BEFORE_WARNING) {
            if (lastMessageWasRight) {
                HardcoreLearning.wrongLanguageCounter--;
            }

            debug('Not enough wrong messages to warn *yet*.');
            return;
        }

        if (!HardcoreLearning.alreadyWarned) {
            Guild.beginnerChannel.send(
                trans('model.hardcoreLearning.warning', [`%${Config.learntLanguage}%`, `%${Config.learntLanguage}%`])
            );
            HardcoreLearning.alreadyWarned = true;
        } else if (!lastMessageWasRight) {
            const emoji = bot.emojis.find(emoji => emoji.name === 'roocop');
            message.react(emoji);
        }

        if (HardcoreLearning.rightLanguageCounter >= RIGHT_LANGUAGES_MESSAGES_BEFORE_RESET) {
            HardcoreLearning.reset();
        }
    },

    reset: () => {
        debug('Happy reset!');
        HardcoreLearning.wrongLanguageCounter = 0;
        HardcoreLearning.rightLanguageCounter = 0;
        HardcoreLearning.alreadyWarned = false;
    }
};

module.exports = HardcoreLearning;