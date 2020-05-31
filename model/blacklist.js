const Guild = require('./guild');
const StatFullBlacklistTriggers = require('./stat-full-blacklist-triggers');
const StatSemiBlacklistTriggers = require('./stat-semi-blacklist-triggers');

const formatBlacklistTerm = (term) => {
    return `(^|\\s)${term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/%/g, '[^\\s]*').toLowerCase()}(\\s|$)`;
};

const Blacklist = {
    /** {Array} */
    semiBlacklistWords: require('../blacklist.json').semi.map(formatBlacklistTerm),

    /** {Array} */
    fullBlacklistWords: require('../blacklist.json').full.map(formatBlacklistTerm),

    /**
     * @param {String} string
     * @returns {boolean}
     */
    isSemiTriggered: (string) => {
        return Blacklist.semiBlacklistWords.some(
            blackWord => string.toLowerCase().match(new RegExp(blackWord)) !== null
        );
    },

    /**
     * @param {String} string
     * @returns {boolean}
     */
    isFullTriggered: (string) => {
        return Blacklist.fullBlacklistWords.some(
            blackWord => string.toLowerCase().match(new RegExp(blackWord)) !== null
        );
    },

    /**
     * @param {Message} message
     */
    parseMessage: async (message) => {
        if (message.guild !== null && !message.author.bot) {
            // Dyno is taking care of the full blacklist for now
            // Update 2020-05-23: NOPE, DYNO IS KICKED LOLZ!!!11!1! HEPBOAT IS IN CHARGE NOW!!
            if (Blacklist.isSemiTriggered(message.cleanContent)) {
                StatSemiBlacklistTriggers.save(message.author.id, '+1');

                Guild.automodChannel.send(
                    trans('model.blacklist.semi.triggered', [message.author, message.channel, message.url], 'en'),
                    await Guild.messageToEmbed(message)
                );
            }

            if (Blacklist.isFullTriggered(message.cleanContent)) {
                StatFullBlacklistTriggers.save(message.author.id, '+1');
            }
        }
    },
};

module.exports = Blacklist;
