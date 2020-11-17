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
            const action = args.shift().toLowerCase();

            switch (action) {
                case 'validate':
                    (cachelessRequire('./correspondence/valid.js'))(message, args);
                    break;

                case 'audition':
                case 'auditer':
                    (cachelessRequire('./correspondence/audit.js'))(message, args);
                    break;

                case 'proposal':
                case 'proposition':
                    (cachelessRequire('./correspondence/prop.js'))(message, args);
                    break;

                case 'audit':
                case 'valid':
                case 'prop':
                case 'done':
                    (cachelessRequire('./correspondence/' + action + '.js'))(message, args);
            }
        } else {
            message.reply(trans('model.command.correspondence.error.missingAction', [], 'en'));
        }
    }
}

module.exports = new Correspondence();
