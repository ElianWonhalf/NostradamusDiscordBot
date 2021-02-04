const Logger = require('@lilywonhalf/pretty-logger');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

const cachelessRequire = (path) => {
    if (typeof path === 'string') {
        delete require.cache[require.resolve(path)];
    }

    return typeof path === 'string' ? require(path) : null;
};

class ModLog
{
    static instance = null;

    constructor() {
        if (ModLog.instance !== null) {
            return ModLog.instance;
        }

        this.aliases = ['modlog', 'modlogs', 'ml'];
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
                case 'send':
                    (cachelessRequire('./mod-log/post.js'))(message, args);
                    break;

                case 'modifier':
                case 'modify':
                    (cachelessRequire('./mod-log/edit.js'))(message, args);
                    break;

                case 'post':
                case 'edit':
                    (cachelessRequire(`./mod-log/${action}.js`))(message, args);
            }
        } else {
            message.channel.send(trans('model.command.modLog.error.missingAction', [], 'en'));
        }
    }
}

module.exports = new ModLog();
