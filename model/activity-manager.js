const { Collection } = require('discord.js');
const Config = require('../config.json');
const Guild = require('./guild');

const memberStateMap = new Collection();

class ActivityManager
{
    init() {
        Guild.discordGuild.members.cache.filter(member => {
            const activity = member.presence.activities.find(activity => activity.type === 'CUSTOM_STATUS');

            return !member.roles.cache.has(Config.roles.mod)
                && activity !== undefined
                && activity.state;
        }).each(member => {
            const activity = member.presence.activities.find(activity => activity.type === 'CUSTOM_STATUS');

            memberStateMap.set(member.id, activity.state);
        });
    }

    /**
     * @param {Presence} presence
     */
    hasNewActivity(presence) {
        const activity = presence.activities.find(activity => activity.type === 'CUSTOM_STATUS');
        const state =  typeof activity !== 'undefined' && activity.state ? activity.state : null;
        const hasNewState = state !== null && memberStateMap.get(presence.userID) !== state;

        if (hasNewState) {
            memberStateMap.set(presence.userID, state);
        }

        return hasNewState;
    }
}

module.exports = new ActivityManager();
