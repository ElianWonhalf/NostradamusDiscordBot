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
            const pickerLang = Guild.isMemberNative(picker) || Guild.isMemberTutor(picker) ? 'fr' : null;
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
            const emojiWaitYes = bot.emojis.cache.find(emoji => emoji.name === 'waityes');
            const emojiWaitNo = bot.emojis.cache.find(emoji => emoji.name === 'waitno');

            picked.send(trans(`model.command.correspondence.prop.${transKey}`, transVariables, pickedLang)).then(() => {
                const emojiPropYes = bot.emojis.cache.find(emoji => emoji.name === 'propyes');
                message.react(emojiPropYes);

                picker.send(trans('model.command.correspondence.wait.dm', [], pickerLang)).then(() => {
                    message.react(emojiWaitYes);
                }).catch((exception) => {
                    message.react(emojiWaitNo);
                    message.reply(trans('model.command.correspondence.error.wait', [picker], 'en'));
                    Logger.exception(exception);
                });
            }).catch(async (exception) => {
                const emojiPropNo = bot.emojis.cache.find(emoji => emoji.name === 'propno');
                message.react(emojiPropNo);
                const repliedMessage = await message.reply(trans('model.command.correspondence.error.prop', [picked, picker], 'en'));
                Logger.exception(exception);

                const emojiPollYes = bot.emojis.cache.find(emoji => emoji.name === 'pollyes');
                const emojiPollNo = bot.emojis.cache.find(emoji => emoji.name === 'pollno');
                const acceptedReactEmojis = [emojiPollYes, emojiPollNo];
                const reactFilter = (reaction, user) => user.id === message.author.id && acceptedReactEmojis.includes(reaction.emoji);

                await repliedMessage.react(emojiPollYes);
                await repliedMessage.react(emojiPollNo);

                repliedMessage.awaitReactions(reactFilter, { max: 1, maxEmojis: 1, time: 15 * MINUTE }).then(async collectedReactions => {
                    if (!collectedReactions.first()) {
                        repliedMessage.reactions.removeAll();
                        message.react(emojiWaitNo);
                    } else {
                        if (collectedReactions.first().emoji === emojiPollNo) {
                            message.react(emojiWaitNo);
                        } else if (collectedReactions.first().emoji === emojiPollYes) {
                            picker.send(trans('model.command.correspondence.wait.dm', [], pickerLang)).then(() => {
                                message.react(emojiWaitYes);
                            }).catch((exception) => {
                                message.react(emojiWaitNo);
                                message.reply(trans('model.command.correspondence.error.wait', [picker], 'en'));
                                Logger.exception(exception);
                            });
                        }
                    }
                });
            });
        } else {
            message.reply(trans('model.command.correspondence.error.badFormat', [], 'en'));
        }
    }
};
