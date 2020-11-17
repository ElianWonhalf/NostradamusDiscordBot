const Logger = require('@lilywonhalf/pretty-logger');
const Guild = require('../../guild');

/**
 * @param {Message} message
 */
module.exports = async (message) => {
    const membersToMessage = Guild.findDesignatedMemberInMessage(message);

    if (membersToMessage.certain === true && membersToMessage.foundMembers.length > 0) {
        for (const target of membersToMessage.foundMembers) {
            const member = await Guild.discordGuild.members.fetch(target.id);
            const lang = Guild.isMemberNative(member) ? 'fr' : null;

            member.send(
                trans('model.command.correspondence.wait.dm', [], lang)
            ).then(() => {
                const emoji = bot.emojis.cache.find(emoji => emoji.name === 'pollyes');
                message.react(emoji);
            }).catch((exception) => {
                message.reply(trans('model.command.correspondence.error.dm', [member], 'en'));
                Logger.exception(exception);
            });
        }
    } else {
        message.reply(trans('model.command.correspondence.error.memberNotFound', [], 'en'));
    }
};
