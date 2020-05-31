const StatEntity = require('./stat-entity');

class StatSemiBlacklistTriggers extends StatEntity
{
    constructor()
    {
        super('stat_semi_blacklist_triggers');
    }
}

module.exports = new StatSemiBlacklistTriggers();