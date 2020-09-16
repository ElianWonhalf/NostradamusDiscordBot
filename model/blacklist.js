const Guild = require('./guild');
const StatFullBlacklistTriggers = require('./stat-full-blacklist-triggers');
const StatSemiBlacklistTriggers = require('./stat-semi-blacklist-triggers');

const formatBlacklistTerm = (term) => {
    return `(^|\\W)(${regexEscape(term).replace(/%/g, '[^\\s]*').toLowerCase()})(\\W|$)`;
};

const Blacklist = {
    /** {Array} */
    semiBlacklistWords: require('../blacklist.json').semi.map(formatBlacklistTerm),

    /** {Array} */
    fullBlacklistWords: require('../blacklist.json').full.map(formatBlacklistTerm),

    /**
     * @param {String} string
     * @returns {Array}
     */
    getSemiWordsInString: (string) => {
        return Blacklist.semiBlacklistWords.filter(
            blackWord => string.toLowerCase().match(new RegExp(blackWord)) !== null
        );
    },

    /**
     * @param {String} string
     * @returns {Array}
     */
    getFullWordsInString: (string) => {
        return Blacklist.fullBlacklistWords.filter(
            blackWord => string.toLowerCase().match(new RegExp(blackWord)) !== null
        );
    },

    /**
     * @param {string} string
     *
     * @returns {string}
     */
    formatWordsInString: (string) => {
        Blacklist.getSemiWordsInString(string).forEach(word => {
            string = string.replace(
                new RegExp(
                    word,
                    'giu'
                ),
                occurrence => {
                    return `***${occurrence}***`;
                }
            );
        });

        Blacklist.getFullWordsInString(string).forEach(word => {
            string = string.replace(
                new RegExp(
                    word,
                    'giu'
                ),
                occurrence => {
                    return `__***${occurrence}***__`;
                }
            );
        });

        return string;
    },

    /**
     * @param {Message} message
     */
    parseMessage: async (message) => {
        if (message.guild !== null && !message.author.bot && !Guild.isMemberMod(message.member)) {
            // Dyno is taking care of the full blacklist for now
            // Update 2020-05-23: NOPE, DYNO IS KICKED LOLZ!!!11!1! HEPBOAT IS IN CHARGE NOW!!
            const semiWords = Blacklist.getSemiWordsInString(message.cleanContent);
            const fullWords = Blacklist.getFullWordsInString(message.cleanContent);

            if (semiWords.length > 0) {
                StatSemiBlacklistTriggers.save(message.author.id, '+1');

                const embed = await Guild.messageToEmbed(message);
                embed.setDescription(Blacklist.formatWordsInString(message.content));

                Guild.automodChannel.send(
                    trans('model.blacklist.semi.triggered', [message.author, message.channel, message.url], 'en'),
                    embed
                );
            }

            if (fullWords.length > 0) {
                StatFullBlacklistTriggers.save(message.author.id, '+1');
            }
        }
    },
};

module.exports = Blacklist;
