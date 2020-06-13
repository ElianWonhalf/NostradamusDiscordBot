const fs = require('fs');
const crypto = require('crypto');
const got = require('got');
const Logger = require('@lilywonhalf/pretty-logger');
const GoogleTranslateToken = require('./google-translate-token');

const domain = 'translate.google.ca';
const basePath = '/translate_tts?ie=UTF-8';

const getURL = async (language, text) => {
    const token = await GoogleTranslateToken.getVoice(text);

    return 'https://' + domain
        + basePath
        + '&q=' + encodeURIComponent(text)
        + '&tl=' + language.toLowerCase()
        + '&total=1&idx=0'
        + '&textlen=' + text.length
        + '&tk=' + token
        + '&client=webapp&prev=input';
};

if (!fs.existsSync('cache')) {
    fs.mkdirSync('cache');
}

if (!fs.existsSync('cache/voice-synthesizer')) {
    fs.mkdirSync('cache/voice-synthesizer');
}

const cacheExists = (key) => {
    return fs.existsSync('cache/voice-synthesizer/' + key + '.mpga');
};

const createCache = (key, data) => {
    return fs.writeFileSync('cache/voice-synthesizer/' + key + '.mpga', data);
};

const getCachePath = (key) => {
    return fs.realpathSync('cache/voice-synthesizer/' + key + '.mpga');
};

const VoiceSynthesizer = {
    synthesize: async (language, text) => {
        const cacheKey = crypto.createHash('sha1').update(language + text).digest('hex');

        if (!cacheExists(cacheKey)) {
            let audio = Buffer.from('');

            try {
                const response = await got(
                    await getURL(language, text),
                    {
                        headers: {
                            'Accept': '*/*',
                            'Cache-Control': 'no-cache',
                            'Host': 'translate.google.ca',
                            'Accept-Encoding': 'gzip, deflate',
                            'Connection': 'keep-alive'
                        },
                        responseType: 'buffer',
                        encoding: null
                    }
                );
                audio = response.body;
            } catch (exception) {
                Logger.exception(exception);
                Logger.info(exception.body.toString());
                Promise.reject();
            }

            if (audio.toString().length > 0) {
                if (audio.toString().indexOf('<!DOCTYPE html') < 0) {
                    createCache(cacheKey, audio);
                } else {
                    Logger.error('Google Translate does not want to synthesize voice anymore :(');
                    Promise.reject();
                }
            } else {
                Promise.reject();
            }
        }

        return getCachePath(cacheKey);
    }
};

module.exports = VoiceSynthesizer;
