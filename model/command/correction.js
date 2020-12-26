const { MessageEmbed } = require('discord.js');
const Config = require('../../config.json');
const Heat = require('../heat');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');
const Guild = require('../guild');
const CorrectionModel = require('../correction');
const Logger = require('@lilywonhalf/pretty-logger');

class Correction extends Heat
{
    static instance = null;

    constructor() {
        if (Correction.instance !== null) {
            return Correction.instance;
        }

        super(10 * SECOND);
        this.aliases = ['corrections', 'corriger'];
        this.category = CommandCategory.RESOURCE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        if (this.canCall()) {
            this.registerCall();

            const member = await Guild.getMemberFromMessage(message);

            if (message.channel.id === Config.channels.roles) {
                if (CorrectionModel.memberNicknameHasEmoji(member)) {
                    await CorrectionModel.removeEmojiFromNickname(member);
                } else {
                    await CorrectionModel.addEmojiToNickname(member).catch(exception => {
                        Logger.exception(exception);
                        message.reply(trans('model.command.correction.error'));
                    });
                }
            } else {
                const embed = new MessageEmbed();
                const description = trans('model.command.correction.reply', [CorrectionModel.CORRECTION_EMOJI_NAME]);

                const sentMessage = await message.channel.send(
                    embed.setDescription(`${description} [](correction)`).setColor(0x00FF00)
                );

                await sentMessage.react(bot.emojis.cache.find(emoji => emoji.name === 'pollyes'));
            }
        } else {
            message.react('⌛');
        }
    }
}

module.exports = new Correction();
