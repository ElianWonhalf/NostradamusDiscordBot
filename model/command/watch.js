const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

const cachelessRequire = (path) => {
    if (typeof path === 'string') {
        delete require.cache[require.resolve(path)];
    }

    return typeof path === 'string' ? require(path) : null;
};

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
            const messageContainsMemberID = message.content.match(/[0-9]{18}/) !== null;
            const memberToWatch = Guild.findDesignatedMemberInMessage(message);

            if (messageContainsMemberID || memberToWatch.certain === true && memberToWatch.foundMembers.length > 0) {
                const target = {};

                if (messageContainsMemberID) {
                    target.id = message.content.match(/[0-9]{18}/)[0];
                    target.label = message.content.match(/[0-9]{18}/)[0];
                } else {
                    target.id = memberToWatch.foundMembers[0].id;
                    target.label = memberToWatch.foundMembers[0].toString();
                }

                switch (args[0].toLowerCase()) {
                    case 'add':
                    case 'remove':
                    case 'edit':
                        (cachelessRequire('./watch/' + args[0].toLowerCase() + '.js'))(message, args, target);
                }
            } else {
                message.reply(trans('model.command.watch.error', [], 'en'));
            }
        }
    }
};
