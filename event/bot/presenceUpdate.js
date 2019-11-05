const Guild = require('../../model/guild');
const Blacklist = require('../../model/blacklist');

/**
 * @param {GuildMember} oldMember
 * @param {GuildMember} newMember
 */
module.exports = (oldMember, newMember) => {
    if (Guild.isMemberMod(oldMember)) {
        return;
    }

    const newHasGame = newMember.presence.game !== null;
    const oldHasGame = oldMember.presence.game !== null;
    const hasCustomStatus = newHasGame && newMember.presence.game.type === 4;
    const differentCustomStatus = oldHasGame && newHasGame && oldMember.presence.game.state !== newMember.presence.game.state;

    if (hasCustomStatus && differentCustomStatus) {
        const state = newMember.presence.game.state === null ? '' : newMember.presence.game.state;

        Guild.serverLogChannel.send(
            trans(
                'model.guild.customStatusUpdate',
                [newMember.toString(), state],
                'en'
            )
        );

        if (Blacklist.isSemiTriggered(state)) {
            Guild.botChannel.send(
                trans(
                    'model.guild.customStatusSemiBlacklist',
                    [newMember.toString(), state],
                    'en'
                )
            )
        }

        if (Blacklist.isFullTriggered(state)) {
            Guild.botChannel.send(
                trans(
                    'model.guild.customStatusFullBlacklist',
                    [newMember.toString(), state],
                    'en'
                )
            )
        }
    }
};
