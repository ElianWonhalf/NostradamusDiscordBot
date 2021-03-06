const { User } = require('discord.js');
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
        this.isAllowedForContext = CommandPermission.isMemberModOrSoft;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        if (args.length > 0) {
            const messageContainsMemberID = message.content.match(/(^| )[0-9]{18}( |$)/gu) !== null;
            const memberToWatch = Guild.findDesignatedMemberInMessage(message);

            if (messageContainsMemberID || memberToWatch.certain === true && memberToWatch.foundMembers.length > 0) {
                const action = args.shift().toLowerCase();
                const foundMembers = memberToWatch.foundMembers;

                // Consider IDs even if the client doesn't know them
                if (messageContainsMemberID) {
                    const foundMemberIds = foundMembers.map(memberOrUser => memberOrUser.id);

                    args.forEach(arg => {
                        if (arg.match(/^[0-9]{16,18}$/u) !== null && !foundMemberIds.includes(arg)) {
                            const user = new User(bot, { id: arg, bot: false });
                            foundMembers.push(user);
                        }
                    });
                }

                const sortedFoundMembers = [];

                foundMembers.forEach(memberOrUser => {
                    if (args.includes(memberOrUser.id) && !sortedFoundMembers.includes(memberOrUser)) {
                        sortedFoundMembers.push(memberOrUser);
                    }
                });

                while (args.length > 1 && args[0].match(/^[0-9]{16,18}$/u)) {
                    args.shift();
                }

                switch (action) {
                    case 'delete':
                        (cachelessRequire('./watch/remove.js'))(message, args.join(' '), sortedFoundMembers);
                        break;

                    case 'add':
                    case 'remove':
                    case 'edit':
                        (cachelessRequire('./watch/' + action + '.js'))(message, args.join(' '), sortedFoundMembers);
                }
            } else {
                message.reply(trans('model.command.watch.error', [], 'en'));
            }
        }
    }
}

module.exports = new Watch();
