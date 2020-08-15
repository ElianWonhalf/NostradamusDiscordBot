const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

const cachelessRequire = (path) => {
    if (typeof path === 'string') {
        delete require.cache[require.resolve(path)];
    }

    return typeof path === 'string' ? require(path) : null;
};

class Watch
{
    static instance = null;

    constructor() {
        if (Watch.instance !== null) {
            return Watch.instance;
        }

        this.aliases = [];
        this.category = CommandCategory.MODERATION;
        this.isAllowedForContext = CommandPermission.isMemberMod;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        if (args.length > 0) {
            const memberToWatch = Guild.findDesignatedMemberInMessage(message);

            if (memberToWatch.certain === true && memberToWatch.foundMembers.length > 0) {
                const action = args.shift().toLowerCase();

                args.splice(0, memberToWatch.foundMembers.length);

                switch (action) {
                    case 'delete':
                        (cachelessRequire('./watch/remove.js'))(message, args.join(' '), memberToWatch.foundMembers);
                        break;

                    case 'add':
                    case 'remove':
                    case 'edit':
                        (cachelessRequire('./watch/' + action + '.js'))(message, args.join(' '), memberToWatch.foundMembers);
                }
            } else {
                message.reply(trans('model.command.watch.error', [], 'en'));
            }
        }
    }
}

module.exports = new Watch();
