const Config = require('../config.json');
const yaml = require('js-yaml');
const fs   = require('fs');

const dictionaries = {
    en: yaml.safeLoad(fs.readFileSync('translations/en.yaml', 'utf8')),
    fr: yaml.safeLoad(fs.readFileSync('translations/fr.yaml', 'utf8'))
};

/**
 * @param {string} value
 * @param {string} language
 * @returns {string}
 */
const translateKeysInString = (value, language) => {
    let keys = value.match(/%[a-zA-Z0-9.]+%/g);

    if (keys !== null) {
        keys.forEach(key => {
            key = key.replace(/%([^%]+)%/, '$1');
            value = value.replace(`%${key}%`, trans(key, [], language));
        });
    }

    return value;
};

/**
 * @param {string} value
 * @param {Array} variables
 * @param {string} language
 * @returns {string}
 */
const replaceVariablesInString = (value, variables, language) => {
    variables.forEach(variable => {
        variable = translateKeysInString(variable, language);
        value = value.replace(/%%/, variable);
    });

    return value;
};

/**
 * @param {string} value
 */
const replaceEmojisInString = (value) => {
    Array.from(new Set(value.match(/:[^\s:]+:/g))).forEach(foundEmoji => {
        foundEmoji = foundEmoji.replace(/:([^:]+):/, '$1');

        const emojiInstance = bot.emojis.find(emoji => emoji.name === foundEmoji);

        if (emojiInstance !== null) {
            value = value.replace(new RegExp(`:${foundEmoji}:`, 'g'), emojiInstance.toString());
        }
    });

    return value;
};

/**
 * A trans-friendly function.
 *
 * @param {string} keyPath
 * @param {Array} [variables]
 * @param {string} [forcedLanguage]
 * @returns {string}
 */
global.trans = (keyPath, variables, forcedLanguage) => {
    variables = variables === undefined ? [] : variables.map(variable => {
        return variable === undefined ? '' : variable.toString();
    });

    const key = keyPath.split('.');
    const decidedLanguage = forcedLanguage === undefined ? Config.botLanguage.split(',') : forcedLanguage.split(',');
    let language = decidedLanguage[0];
    let value = dictionaries[language];
    let finalTranslation = '';

    key.forEach(part => {
        value = value[part] !== undefined ? value[part] : {};
    });

    if (typeof value === 'string') {
        value = replaceVariablesInString(value, variables, language);
        value = translateKeysInString(value, language);
        finalTranslation = value;
    } else {
        debug(`Missing translation in ${language} dictionary: ${key.join('.')}`);
    }

    if (decidedLanguage.length > 1) {
        language = decidedLanguage[1];
        value = dictionaries[language];

        key.forEach(part => {
            value = value[part] !== undefined ? value[part] : {};
        });

        if (typeof value === 'string') {
            if (finalTranslation.length > 0) {
                finalTranslation += ' / ';
            }

            value = replaceVariablesInString(value, variables, language);
            value = translateKeysInString(value, language);
            finalTranslation += value;
        } else {
            debug(`Missing translation in ${language} dictionary: ${key.join('.')}`);
        }
    }

    finalTranslation = finalTranslation.length > 0 ? replaceEmojisInString(finalTranslation) : key;

    return finalTranslation;
};

