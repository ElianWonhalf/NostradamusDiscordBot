const Config = require('../config.json');

global.DATE_FORMAT_OPTIONS = {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
};

// Of course this is copy-pasted from Stack Overflow!
// https://stackoverflow.com/a/7751977/3551909
global.TWO_WEEKS = 12096e5;
global.SECOND = 1000;
global.MINUTE = 60 * SECOND;
global.HOUR = 60 * MINUTE;
global.DAY = 24 * HOUR;

global.secondsAmountToDelayString = (seconds, upTo = 'second', isDelay = false) => {
    seconds = parseInt(seconds);

    const nullTranslation = isDelay ? 'noTime' : 'today';
    let upToReached = false;

    // 3600 seconds is 1 hour
    const parts = {
        year: Math.floor(seconds / (3600 * 24 * 365)),
        // No month, because month is a horrible unit, I hate it
        day: Math.floor(seconds % (3600 * 24 * 365) / (3600 * 24)),
        hour: Math.floor(seconds % (3600 * 24) / 3600),
        minute: Math.floor(seconds % 3600 / 60),
        second: Math.floor(seconds % 60)
    };

    const string = Object.keys(parts).filter(part => {
        const keep = !upToReached;

        if (part === upTo) {
            upToReached = true;
        }

        return keep;
    }).reduce((carry, part) => {
        if (parts[part] > 0) {
            carry += `${parts[part]} ${trans(`model.datetime.${part}`, [], Config.learntLanguagePrefix)}`;

            if (parts[part] > 1) {
                carry += 's';
            }

            carry += ', ';
        }

        return carry;
    }, '').replace(/, $/u, '').replace(/,([^,]+)$/u, ' et $1').trim();

    return string.length > 0 ? string : trans(`model.datetime.${nullTranslation}`, [], Config.learntLanguagePrefix);
};