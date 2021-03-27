const Guild = require('../../model/guild');
const Blacklist = require('../../model/blacklist');
const ActivityManager = require('../../model/activity-manager');

/**
 * @param {Presence} oldPresence
 * @param {Presence} newPresence
 */
module.exports = (oldPresence, newPresence) => {
    const oldMember = oldPresence !== undefined ? oldPresence.member : null;
    const newMember = newPresence !== undefined ? newPresence.member : null;
    const member = oldMember !== null ? oldMember : newMember;

    if (!isRightGuild(member.guild.id) || Guild.isMemberMod(member)) {
        return;
    }
    const newCustomStatus = newPresence !== undefined
        ? newPresence.activities.find(activity => activity.type === 'CUSTOM_STATUS')
        : undefined;

    if (ActivityManager.hasNewActivity(newPresence)) {
        const state = newCustomStatus.state ? newCustomStatus.state : '';
        const fullWords = Blacklist.getFullWordsInString(state);
        const formattedState = Blacklist.formatWordsInString(state);

        Guild.serverLogChannel.send(
            trans(
                'model.guild.customStatusUpdate',
                [member.toString(), state],
                'en'
            )
        );

        if (fullWords.length > 0) {
            Guild.automodChannel.send(
                trans(
                    'model.guild.customStatusFullBlacklist',
                    [member.toString(), formattedState],
                    'en'
                )
            )
        }
    }
};
