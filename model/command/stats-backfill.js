const fs = require('fs');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

const cachelessRequire = (path) => {
    if (typeof path === 'string') {
        delete require.cache[require.resolve(path)];
    }

    return typeof path === 'string' ? require(path) : null;
};

class StatsBackfill
{
    static instance = null;

    constructor() {
        if (StatsBackfill.instance !== null) {
            return StatsBackfill.instance;
        }

        this.aliases = ['statsbackfill', 'backfillstats', 'backfill-stats'];
        this.category = CommandCategory.BOT_MANAGEMENT;
        this.isAllowedForContext = CommandPermission.isMommy;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        if (!fs.existsSync('./cache')) {
            fs.mkdirSync('./cache');
        }

        if (!fs.existsSync('./cache/stats-backfill')) {
            fs.mkdirSync('./cache/stats-backfill');
        }

        if (args.length > 0) {
            switch (args[0].toLowerCase()) {
                case 'messages':
                    (cachelessRequire('./stats-backfill/' + args[0].toLowerCase() + '.js'))(message);
            }
        }
    }
}

module.exports = new StatsBackfill();
