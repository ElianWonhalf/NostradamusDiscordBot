const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

const cachelessRequire = (path) => {
    if (typeof path === 'string') {
        delete require.cache[require.resolve(path)];
    }

    return typeof path === 'string' ? require(path) : null;
};

class Correspondence
{
    static instance = null;

    constructor() {
        if (Correspondence.instance !== null) {
            return Correspondence.instance;
        }

        this.aliases = ['correspondent', 'correspodance', 'correspondant', 'c'];
        this.category = CommandCategory.MODERATION;
        this.isAllowedForContext = CommandPermission.isMemberModOrSoft;
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
                const foundMembers = memberToWatch.foundMembers;

                args.splice(0, foundMembers.length);

                switch (action) {
                    case 'audition':
                    case 'auditer':
                        (cachelessRequire('./correspondence/audit.js'))(message, foundMembers, args.join(' '));
                        break;

                    case 'audit':
                        (cachelessRequire('./correspondence/' + action + '.js'))(message, foundMembers, args.join(' '));
                }
            } else {
                message.reply(trans('model.command.correspondence.notFound', [], 'en'));
            }
        } else {
            message.reply(trans('model.command.correspondence.badFormat', [], 'en'));
        }
    }
}

module.exports = new Correspondence();
