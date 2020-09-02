const Logger = require('@lilywonhalf/pretty-logger');
const Guild = require('../../guild');

module.exports = async (message, targets) => {
    for (const target of targets) {
        const member = await Guild.discordGuild.members.fetch(target.id);
        const lang = Guild.isMemberNative(member) ? 'fr' : null;

        member.send(
            trans('model.command.correspondence.audit.dm', [], lang)
        ).then(() => {
            const emoji = bot.emojis.cache.find(emoji => emoji.name === 'pollyes');
            message.react(emoji);
        }).catch((exception) => {
            message.reply(trans('model.command.correspondence.audit.error', [member], 'en'));
            Logger.exception(exception);
        });
    }
};
