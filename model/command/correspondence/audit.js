const Logger = require('@lilywonhalf/pretty-logger');
const CommandPermission = require('../../command-permission');
const Guild = require('../../guild');

/**
 * @param {Message} message
 */
module.exports = async (message) => {
    if (await CommandPermission.isMemberModOrSoft(message)) {
        const membersToAudit = Guild.findDesignatedMemberInMessage(message);

        if (membersToAudit.certain === true && membersToAudit.foundMembers.length > 0) {
            for (const target of membersToAudit.foundMembers) {
                const member = await Guild.discordGuild.members.fetch(target.id);
                const lang = Guild.isMemberNative(member) || Guild.isMemberTutor(member) ? 'fr' : null;

                member.send(
                    trans('model.command.correspondence.audit.dm', [], lang)
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
    }
};
