const Logger = require('@lilywonhalf/pretty-logger');
const CommandPermission = require('../../command-permission');
const Guild = require('../../guild');
const Correspondence = require('../../correspondence');

/**
 * @param {Message} message
 * @param {Array} args
 */
module.exports = async (message, args) => {
    if (await CommandPermission.isMemberModOrSoft(message)) {
        const pickedMembers = Guild.findDesignatedMemberInMessage(message);

        if (pickedMembers.certain === true && pickedMembers.foundMembers.length === 2) {
            const picked = await Guild.discordGuild.members.fetch(pickedMembers.foundMembers[0].id);
            const picker = await Guild.discordGuild.members.fetch(pickedMembers.foundMembers[1].id);

            const pickedLang = Guild.isMemberNative(picked) || Guild.isMemberTutor(picked) ? 'fr' : null;
            const pickerIntroduction = await Correspondence.findIntroduction(picker.id);
            const transKey = pickerIntroduction ? 'dm' : 'dmWithoutLink';
            const transVariables = [picker.toString()];

            if (pickerIntroduction) {
                transVariables.push(pickerIntroduction.url);
            } else {
                Guild.modDMsChannel.send(
                    trans('model.command.correspondence.error.introductionNotFound', [picker.toString()], 'en')
                );
            }

            transVariables.push(Guild.correspondenceLearnersChannel.toString());

            picked.send(trans(`model.command.correspondence.prop.${transKey}`, transVariables, pickedLang)).then(() => {
                const emoji = bot.emojis.cache.find(emoji => emoji.name === 'pollyes');
                message.react(emoji);
            }).catch((exception) => {
                message.reply(trans('model.command.correspondence.error.dm', [member], 'en'));
                Logger.exception(exception);
            });
        } else {
            message.reply(trans('model.command.correspondence.error.badFormat', [], 'en'));
        }
    }
};
