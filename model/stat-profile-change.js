const StatEntity = require('./stat-entity');

class StatProfileChange extends StatEntity
{
    constructor()
    {
        super('stat_profile_change');
    }

    static get TYPE_NICKNAME()
    {
        return 'nickname';
    }

    static get TYPE_USERNAME()
    {
        return 'username';
    }

    static get TYPE_AVATAR()
    {
        return 'avatar';
    }
}

module.exports = new StatProfileChange();