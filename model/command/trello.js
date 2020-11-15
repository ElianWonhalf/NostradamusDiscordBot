const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');
const TrelloModel = require('../trello');

const cachelessRequire = (path) => {
    if (typeof path === 'string') {
        delete require.cache[require.resolve(path)];
    }

    return typeof path === 'string' ? require(path) : null;
};

class Trello
{
    static instance = null;

    constructor() {
        if (Trello.instance !== null) {
            return Trello.instance;
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
            const action = args.shift();

            switch (action) {
                case 'todo':
                    (cachelessRequire('./trello/add-card.js'))(message, args, TrelloModel.ID_LIST_TODO);
                    break;

                case 'vote':
                    (cachelessRequire('./trello/add-card.js'))(message, args, TrelloModel.ID_LIST_VOTES, true);
                    break;

                case 'ping':
                    (cachelessRequire(`./trello/${action}.js`))(message, args);
                    break;

                default:
                    await message.reply(trans('model.command.trello.unknownAction', [], 'en'));
            }
        } else {
            await message.reply(trans('model.command.trello.noAction', [], 'en'));
        }
    }
}

module.exports = new Trello();
