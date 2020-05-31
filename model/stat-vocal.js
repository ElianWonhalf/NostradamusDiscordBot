const StatEntity = require('./stat-entity');

class StatVocal extends StatEntity
{
    constructor()
    {
        super('stat_vocal');
    }
}

module.exports = new StatVocal();
