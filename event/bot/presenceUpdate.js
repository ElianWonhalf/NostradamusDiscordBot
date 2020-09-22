const Guild = require('../../model/guild');
const Blacklist = require('../../model/blacklist');

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

    const oldCustomStatus = oldPresence !== undefined
        ? oldPresence.activities.find(activity => activity.type === 'CUSTOM_STATUS')
        : undefined;

    const newCustomStatus = newPresence !== undefined
        ? newPresence.activities.find(activity => activity.type === 'CUSTOM_STATUS')
        : undefined;

    const oldHasCustomStatus = oldCustomStatus !== undefined;
    const newHasCustomStatus = newCustomStatus !== undefined;

    const differentCustomStatus = oldHasCustomStatus && newHasCustomStatus && oldCustomStatus.state !== newCustomStatus.state;

    if (newHasCustomStatus && differentCustomStatus) {
        const state = newCustomStatus.state === null ? '' : newCustomStatus.state;
        const semiWords = Blacklist.getSemiWordsInString(state);
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
        } else if (semiWords.length > 0) {
            Guild.automodChannel.send(
                trans(
                    'model.guild.customStatusSemiBlacklist',
                    [member.toString(), formattedState],
                    'en'
                )
            )
        }
    }
};
