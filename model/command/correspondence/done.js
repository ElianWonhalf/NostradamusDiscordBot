const Logger = require('@lilywonhalf/pretty-logger');
const Config = require('../../../config.json');
const Guild = require('../../guild');
const Correspondence = require('../../correspondence');

/**
 * @param {Message} message
 * @param {Array} args
 */
module.exports = async (message, args) => {
    const pickedMembers = Guild.findDesignatedMemberInMessage(message);

    if (pickedMembers.certain === true && pickedMembers.foundMembers.length === 2) {
        const members = [
            await Guild.discordGuild.members.fetch(pickedMembers.foundMembers[0].id),
            await Guild.discordGuild.members.fetch(pickedMembers.foundMembers[1].id)
        ];

        let nativeIndex = members.findIndex(
            member => Guild.isMemberNative(member) || Guild.isMemberTutor(member)
        ) || 0;

        const native = members[nativeIndex];
        const learner = members[!nativeIndex ? 1 : 0];

        const nativeLang = Config.learntLanguagePrefix;
        const learnerLang = Guild.isMemberNative(learner) || Guild.isMemberTutor(member) ? 'fr' : null;
        const learnerIntroduction = await Correspondence.findIntroduction(learner.id);

        await learner.roles.remove(Config.roles.seekingCorrespondence);
        await learner.roles.add(Config.roles.corresponding);
        await native.roles.add(Config.roles.corresponding);

        if (learnerIntroduction) {
            await learnerIntroduction.delete();
        } else {
            Guild.modDMsChannel.send(
                trans('model.command.correspondence.error.introductionNotFound', [learner.toString()], 'en')
            );
        }

        await Promise.all([
            native.send(trans(`model.command.correspondence.done.dm`, [learner.toString()], nativeLang)).catch((exception) => {
                message.reply(trans('model.command.correspondence.error.dm', [learner], 'en'));
                Logger.exception(exception);
                throw exception;
            }),
            learner.send(trans(`model.command.correspondence.done.dm`, [native.toString()], learnerLang)).catch((exception) => {
                message.reply(trans('model.command.correspondence.error.dm', [native], 'en'));
                Logger.exception(exception);
                throw exception;
            })
        ]).then(() => {
            const emoji = bot.emojis.cache.find(emoji => emoji.name === 'pollyes');
            return message.react(emoji);
        }).catch((exception) => {
            const emoji = bot.emojis.cache.find(emoji => emoji.name === 'pollno');
            return message.react(emoji);
        });

        const nativeIntroduction = await Correspondence.findIntroduction(native.id);

        if (nativeIntroduction) {
            const nativeSecondDM = await native.send(trans(`model.command.correspondence.done.nativeSecondDM`, [], nativeLang));

            if (nativeSecondDM) {
                const filter = (reaction, user) => {
                    return ['pollyes', 'pollno'].includes(reaction.emoji.name) && user.id === native.id;
                };

                // 5 minutes
                nativeSecondDM.awaitReactions(filter, { time: 5 * MINUTE, max: 1 }).then(async collected => {
                    let deleteIntroduction = true;

                    if (collected.size > 0) {
                        deleteIntroduction = collected.first().emoji.name === 'pollyes';
                    }

                    if (deleteIntroduction) {
                        await nativeIntroduction.delete();
                        await native.roles.remove(Config.roles.seekingCorrespondence);
                        await native.send(trans(`model.command.correspondence.done.introductionDeleted`, [], nativeLang))
                    } else {
                        await native.send(trans(`model.command.correspondence.done.introductionKept`, [], nativeLang))
                    }
                }).catch(Logger.exception);

                const emojis = [
                    bot.emojis.cache.find(emoji => emoji.name === 'pollyes'),
                    bot.emojis.cache.find(emoji => emoji.name === 'pollno')
                ];

                for (let emoji of emojis) {
                    await nativeSecondDM.react(emoji);
                }
            }
        } else {
            Guild.modDMsChannel.send(
                trans('model.command.correspondence.error.introductionNotFound', [native.toString()], 'en')
            );
        }
    } else {
        message.reply(trans('model.command.correspondence.error.badFormat', [], 'en'));
    }
};
