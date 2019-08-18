const Guild = require('./guild');

const SemiBlacklist = {
    /** {Array} */
    words: require('../semi-blacklist.json').map(term => {
        return `^${term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&').replace(/%/g, '[^\\s]*').toLowerCase()}$`;
    }),

    /**
     * @param {Message} message
     */
    parseMessage: async (message) => {
        if (message.guild !== null) {
            const messageWords = message.content.toLowerCase().split(' ');
            const triggered = messageWords.some(
                word => SemiBlacklist.words.some(
                    blackWord => word.match(new RegExp(blackWord)) !== null
                )
            );

            if (triggered) {
                Guild.automodChannel.send(
                    trans('model.semiBlacklist.triggered', [message.author, message.channel, message.url], 'en'),
                    Guild.messageToEmbed(message)
                )
            }
        }
    },
};

module.exports = SemiBlacklist;
