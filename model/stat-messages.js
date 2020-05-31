const StatEntity = require('./stat-entity');

class StatMessages extends StatEntity
{
    constructor()
    {
        super('stat_messages');
    }
}

module.exports = new StatMessages();