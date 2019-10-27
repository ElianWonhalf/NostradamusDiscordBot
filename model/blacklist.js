const Guild = require('./guild');
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
        if (message.guild !== null && message.author.id !== bot.user.id) {
            // Dyno is taking care of the full blacklist for now
            if (Blacklist.isSemiTriggered(message.cleanContent)) {
                Guild.automodChannel.send(
                    trans('model.blacklist.semi.triggered', [message.author, message.channel, message.url], 'en'),
                    await Guild.messageToEmbed(message)
                )
            }
        }
    },
};

module.exports = Blacklist;
