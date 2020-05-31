const StatEntity = require('./stat-entity');

class StatFullBlacklistTriggers extends StatEntity
{
    constructor()
    {
        super('stat_full_blacklist_triggers');
    }
}

module.exports = new StatFullBlacklistTriggers();