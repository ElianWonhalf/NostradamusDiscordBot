const Logger = require('@lilywonhalf/pretty-logger');
const Discord = require('discord.js');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');
const Guild = require('../guild');
const LawlessFrench = require('../lawlessfrench');

class QuestionOfTheDay
{
    static instance = null;
    static lawlessFrenchIconURL = 'https://www.lawlessfrench.com/wp-content/uploads/favicon-32x32.png';
    static wordOfTheDayURL = 'https://www.lawlessfrench.com/vocabulary/mot-du-jour/';

    constructor() {
        if (QuestionOfTheDay.instance !== null) {
            return QuestionOfTheDay.instance;
        }

        this.aliases = ['qod'];
        this.category = CommandCategory.RESOURCE;
        this.isAllowedForContext = CommandPermission.isMommy;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        if (args && args.length > 0) {
            const embed = new Discord.MessageEmbed()
                .setAuthor(
                    'Mot du jour avec Lawless French',
                    QuestionOfTheDay.lawlessFrenchIconURL,
                    QuestionOfTheDay.wordOfTheDayURL
                )
                .setColor(0x00FF00)
                .setDescription(
                    trans(
                        'model.command.questionOfTheDay.reply',
                        [
                            await LawlessFrench.getWordOfTheDay(),
                            args.join(' '),
                            QuestionOfTheDay.wordOfTheDayURL
                        ]
                    )
                )
                .setFooter(trans('model.command.questionOfTheDay.footer'));

            Guild.lessonOfTheDayChannel.send(embed).then(async () => {
                await message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollyes'));
            }).catch(async (error) => {
                Logger.error(error.toString());
                await message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollno'));
            });
        } else {
            await message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollno'));
        }
    }
}

module.exports = new QuestionOfTheDay();
