const fs = require('fs');
const Parser = require('rss-parser');
const Logger = require('@lilywonhalf/pretty-logger');
const Config = require('../config.json');

if (!fs.existsSync('cache')) {
    fs.mkdirSync('cache');
}

if (!fs.existsSync('cache/lawlessfrench')) {
    fs.mkdirSync('cache/lawlessfrench');
}

/**
 * @returns {boolean}
 */
const cacheExists = () => {
    return fs.existsSync('cache/lawlessfrench/word');
};

/**
 * @param {string} data
 */
const writeCache = (data) => {
    return fs.writeFileSync('cache/lawlessfrench/word', data);
};

/**
 * @returns {string}
 */
const getCache = () => {
    return cacheExists() ? fs.readFileSync('cache/lawlessfrench/word', 'utf8') : null;
};

const LawlessFrench = {
    WORD_OF_THE_DAY_URL: 'https://feeds.feedblitz.com/motdujour&x=1',

    /**
     * @returns {Promise<string>}
     */
    getWordOfTheDay: async (force = false) => {
        let word;

        if (force || !cacheExists()) {
            const parser = new Parser();
            const feed = await parser.parseURL(LawlessFrench.WORD_OF_THE_DAY_URL);

            word = feed.items[0].title;
            writeCache(word);
        } else {
            word = getCache();
        }

        return word;
    },

    /**
     * @returns {Promise<string|null>}
     */
    getNewWordOfTheDay: async () => {
        const cachedWord = cacheExists() ? getCache() : null;
        const wordOfTheDay = await LawlessFrench.getWordOfTheDay(true);

        return wordOfTheDay !== cachedWord ? wordOfTheDay : null;
    },

    intervalHandler: async () => {
        const newWord = await LawlessFrench.getNewWordOfTheDay().catch(Logger.exception);

        if (newWord) {
            await bot.users.cache.get(Config.admin).send(
                trans('model.lawlessFrench.intervalHandler.newWord', [newWord], 'en')
            );
        }
    },
};

module.exports = LawlessFrench;
