const StatEntity = require('./stat-entity');

class StatInviteLinks extends StatEntity
{
    constructor()
    {
        super('stat_invite_links');
    }
}

module.exports = new StatInviteLinks();