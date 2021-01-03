/**
 * https://translate.google.com/translate/releases/twsfe_w_20160620_RC00/r/js/desktop_module_main.js
 * Everything between 'BEGIN' and 'END' was copied from the url above.
 *
 * Original code from https://github.com/matheuss/google-translate-token, fixed it here
 */

const got = require('got');
const Configstore = require('configstore');

/* eslint-disable */
// BEGIN

function sM(a) {
    var b;
    if (null !== yr)
        b = yr;
    else {
        b = wr(String.fromCharCode(84));
        var c = wr(String.fromCharCode(75));
        b = [b(), b()];
        b[1] = c();
        b = (yr = window[b.join(c())] || "") || ""
    }
    var d = wr(String.fromCharCode(116))
        , c = wr(String.fromCharCode(107))
        , d = [d(), d()];
    d[1] = c();
    c = "&" + d.join("") + "=";
    d = b.split(".");
    b = Number(d[0]) || 0;
    for (var e = [], f = 0, g = 0; g < a.length; g++) {
        var l = a.charCodeAt(g);
        128 > l ? e[f++] = l : (2048 > l ? e[f++] = l >> 6 | 192 : (55296 == (l & 64512) && g + 1 < a.length && 56320 == (a.charCodeAt(g + 1) & 64512) ? (l = 65536 + ((l & 1023) << 10) + (a.charCodeAt(++g) & 1023),
            e[f++] = l >> 18 | 240,
            e[f++] = l >> 12 & 63 | 128) : e[f++] = l >> 12 | 224,
            e[f++] = l >> 6 & 63 | 128),
            e[f++] = l & 63 | 128)
    }
    a = b;
    for (f = 0; f < e.length; f++)
        a += e[f],
            a = xr(a, "+-a^+6");
    a = xr(a, "+-3^+b+-f");
    a ^= Number(d[1]) || 0;
    0 > a && (a = (a & 2147483647) + 2147483648);
    a %= 1E6;
    return c + (a.toString() + "." + (a ^ b))
}

var yr = null;
var wr = function(a) {
    return function() {
        return a
    }
}
    , xr = function(a, b) {
    for (var c = 0; c < b.length - 2; c += 3) {
        var d = b.charAt(c + 2)
            , d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d)
            , d = "+" == b.charAt(c + 1) ? a >>> d : a << d;
        a = "+" == b.charAt(c) ? a + d & 4294967295 : a ^ d
    }
    return a
};

// END
/* eslint-enable */

const config = new Configstore('google-translate-api');

const window = {
    TKK: config.get('TKK') || '0'
};

function updateTKK() {
    return new Promise(function (resolve, reject) {
        const now = Math.floor(Date.now() / 3600000);

        if (Number(window.TKK.split('.')[0]) === now) {
            resolve();
        } else {
            got('https://translate.google.com').then(function (res) {
                const matches = res.body.match(/tkk:'([^']+)'/g);

                if (matches.length > 0) {
                    const code = matches[0].replace(/tkk:'([^']+)'/, '$1');

                    if (code) {
                        const TKK = code;
                        /* eslint-disable no-undef */
                        if (typeof TKK !== 'undefined') {
                            window.TKK = TKK;
                            config.set('TKK', TKK);
                        }
                        /* eslint-enable no-undef */
                    }
                }

                /**
                 * Note: If the regex or the eval fail, there is no need to worry. The server will accept
                 * relatively old seeds.
                 */

                resolve();
            }).catch(function (err) {
                const e = new Error();
                e.code = 'BAD_NETWORK';
                e.message = err.message;
                reject(e);
            });
        }
    });
}

var cu = function(a) {
    return function() {
        return a
    }
};

var du = function(a, b) {
    for (var c = 0; c < b.length - 2; c += 3) {
        var d = b.charAt(c + 2);
        d = "a" <= d ? d.charCodeAt(0) - 87 : Number(d);
        d = "+" == b.charAt(c + 1) ? a >>> d : a << d;
        a = "+" == b.charAt(c) ? a + d & 4294967295 : a ^ d
    }

    return a
};

var eu = null;

var fu = function(a) {
    if (null !== eu)
        var b = eu;
    else {
        b = cu(String.fromCharCode(84));
        var c = cu(String.fromCharCode(75));
        b = [b(), b()];
        b[1] = c();
        b = (eu = window[b.join(c())] || "") || ""
    }
    var d = cu(String.fromCharCode(116));
    c = cu(String.fromCharCode(107));
    d = [d(), d()];
    d[1] = c();
    c = "&" + d.join("") + "=";
    d = b.split(".");
    b = Number(d[0]) || 0;

    for (var e = [], f = 0, g = 0; g < a.length; g++) {
        var k = a.charCodeAt(g);
        128 > k ? e[f++] = k : (2048 > k ? e[f++] = k >> 6 | 192 : (55296 == (k & 64512) && g + 1 < a.length && 56320 == (a.charCodeAt(g + 1) & 64512) ? (k = 65536 + ((k & 1023) << 10) + (a.charCodeAt(++g) & 1023),
            e[f++] = k >> 18 | 240,
            e[f++] = k >> 12 & 63 | 128) : e[f++] = k >> 12 | 224,
            e[f++] = k >> 6 & 63 | 128),
            e[f++] = k & 63 | 128)
    }

    a = b;

    for (f = 0; f < e.length; f++)
        a += e[f],
            a = du(a, "+-a^+6");

    a = du(a, "+-3^+b+-f");
    a ^= Number(d[1]) || 0;
    0 > a && (a = (a & 2147483647) + 2147483648);
    a %= 1E6;

    return c + (a.toString() + "." + (a ^ b));
};

function get(text) {
    return updateTKK().then(function () {
        return sM(text).replace('&tk=', '');
    }).catch(function (err) {
        throw err;
    });
}

const getVoice = (text) => {
    return updateTKK().then(function () {
        return fu(text).replace('&tk=', '');
    }).catch(function (err) {
        throw err;
    });
};

// The two token systems probably are actually only one
// but now that it works, I don't want to touch it anymore.
module.exports = {get, getVoice};
