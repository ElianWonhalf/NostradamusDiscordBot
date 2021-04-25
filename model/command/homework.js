const Heat = require('../heat');
const { MessageEmbed } = require('discord.js');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

const emojiFrench = bot.emojis.cache.find(emoji => emoji.name === 'afrench');
const emojiAnglophonie = bot.emojis.cache.find(emoji => emoji.name === 'anglophonie');

class Homework extends Heat
{
    static instance = null;

    constructor() {
        if (Homework.instance !== null) {
            return Homework.instance;
        }

        super(10 * SECOND);
        this.aliases = ['homeworkhelp', 'devoirs'];
        this.category = CommandCategory.RESOURCE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        if (this.canCall()) {
            this.registerCall();
            message.delete();

            if (Math.random() < 0.09) {
                message.channel.send({
                    files: [{
                        attachment: 'static/images/homework-rule.png',
                        name: 'homework-rule.png'
                    }]
                })
            } else {
                const embed = new MessageEmbed()
                    .setDescription(
                        `${emojiFrench} **French version**
                        ${trans('model.command.homework.reply', [emojiFrench], 'fr')}
                        ${emojiAnglophonie} **English version**
                        ${trans('model.command.homework.reply', [emojiAnglophonie], 'en')}
                        [Cliquez ici pour en savoir plus / Click here to know more](https://discord.com/channels/254463427949494292/557006102483435543/832654588326445056)`
                    );
                message.channel.send(embed);
            }
        } else {
            message.react('⌛');
        }
    }
}

module.exports = new Homework();
