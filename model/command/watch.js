const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

/**
 * @param {Message} message
 * @param {Array} args
 */
module.exports = {
    aliases: [],
    category: CommandCategory.MODERATION,
    isAllowedForContext: CommandPermission.isMemberMod,
    process: async (message, args) => {
        if (args.length > 0) {
            switch (args[0].toLowerCase()) {
                case 'add':
                case 'remove':
                case 'edit':
                    (require('./watch/' + args[0].toLowerCase() + '.js'))(message, args);
            }
        }
    }
};
