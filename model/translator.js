const Config = require('../config.json');
const yaml = require('js-yaml');
const fs   = require('fs');

const dictionaries = {
    en: yaml.safeLoad(fs.readFileSync('translations/en.yaml', 'utf8')),
    fr: yaml.safeLoad(fs.readFileSync('translations/fr.yaml', 'utf8'))
};

/**
 * @param {Array} value
 * @param {string} language
 * @returns {string}
 */
const translateKeysInString = (value, language) => {
    let translation = value;

    if (Array.isArray(value)) {
        const key = value[0];
        const variables = value[1] || [];
        language = value[2] || language;

        translation = trans(key, variables, language);
    }

    return translation.toString();
};

/**
 * @param {string} value
 * @param {Array} variables
 * @param {string|null} language
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
        return variable === undefined || variable === null ? '' : variable;
    });

    const key = keyPath.split('.');
    const decidedLanguage = forcedLanguage === undefined || forcedLanguage === null
        ? Config.botLanguage.split(',')
        : forcedLanguage.split(',');

    let language = decidedLanguage[0];
    let firstKey = dictionaries[language];
    let secondKey = null;
    let finalTranslation = '';

    key.forEach(part => {
        firstKey = firstKey[part] !== undefined ? firstKey[part] : {};
    });

    if (decidedLanguage.length > 1) {
        secondKey = dictionaries[decidedLanguage[1]];

        key.forEach(part => {
            secondKey = secondKey[part] !== undefined ? secondKey[part] : {};
        });
    }

    if (typeof firstKey === 'string') {
        finalTranslation = replaceVariablesInString(
            firstKey,
            variables,
            firstKey === secondKey ? null : language
        );
    } else {
        debug(`Missing translation in ${language} dictionary: ${key.join('.')}`);
    }

    if (decidedLanguage.length > 1 && firstKey !== secondKey) {
        language = decidedLanguage[1];

        if (typeof secondKey === 'string') {
            let value = replaceVariablesInString(secondKey, variables, language);

            if (finalTranslation.length > 0) {
                finalTranslation += ' / ';
            }

            finalTranslation += value;
        } else {
            debug(`Missing translation in ${language} dictionary: ${key.join('.')}`);
        }
    }

    finalTranslation = finalTranslation.length > 0 ? replaceEmojisInString(finalTranslation) : key;

    return finalTranslation;
};

