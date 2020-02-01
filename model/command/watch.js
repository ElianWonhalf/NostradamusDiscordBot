const Guild = require('../guild');
const CommandCategory = require('../command-category');

/**
 * @param {Message} message
 * @param {Array} args
 */
module.exports = {
    aliases: [],
    category: CommandCategory.MODERATION,
    process: async (message, args) => {
        const member = await Guild.getMemberFromMessage(message);

        if (Guild.isMemberMod(member) && args.length > 0) {
            switch (args[0].toLowerCase()) {
                case 'add':
                case 'remove':
                case 'edit':
                    (require('./watch/' + args[0].toLowerCase() + '.js'))(message, args);
            }
        }
    }
};
