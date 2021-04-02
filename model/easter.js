const { MessageEmbed } = require('discord.js');
const MemberToken = require('./member-token');
const {
    beginnerChannel,
    learntLanguageChannel,
    learntLanguageCloneChannel,
    otherLanguageChannel,
    otherLanguagesChannel
} = require('./guild');

class Easter
{
    static instance = null;

    constructor() {
        if (Easter.instance !== null) {
            return Easter.instance;
        }

        this.minuteIncrement = 0;
        this.triggerTime = 0;//TODO 5;
        this.emojiBunny = bot.emojis.cache.find(emoji => emoji.name === 'runningRabbit');
        this.emojiBunnyEars = bot.emojis.cache.find(emoji => emoji.name === 'bunny');
        this.possibleChannels = [
            beginnerChannel,
            learntLanguageChannel,
            learntLanguageCloneChannel,
            otherLanguageChannel,
            otherLanguagesChannel
        ];
        this.possibleEggs = [
            bot.emojis.cache.find(emoji => emoji.name === 'oeuf1'), 
            bot.emojis.cache.find(emoji => emoji.name === 'oeuf2'), 
            bot.emojis.cache.find(emoji => emoji.name === 'oeuf3'), 
            bot.emojis.cache.find(emoji => emoji.name === 'oeuf4'), 
            bot.emojis.cache.find(emoji => emoji.name === 'oeuf5'), 
            bot.emojis.cache.find(emoji => emoji.name === 'oeuf6'), 
            bot.emojis.cache.find(emoji => emoji.name === 'oeuf7'), 
            bot.emojis.cache.find(emoji => emoji.name === 'oeuf8'),
        ];
        this.embedCatchTheBunny = new MessageEmbed()
            .setThumbnail(this.emojiBunny.url)
            .setDescription(trans('model.easter.somethingRunning'))
            .setFooter(trans('model.easter.catchIt'));
        this.embedTheBunnyRunAway = new MessageEmbed()
            .setDescription(trans('model.easter.bunnyLeave'));
    }

    async minuteHandler() {
        this.minuteIncrement++;

        if (this.minuteIncrement >= this.triggerTime) {
            this.minuteIncrement = 0;
            this.triggerTime = 1;//TODO Math.ceil(Math.random() * 20) + 10;
            const data = await this.getData();

            this.process(data);
        }
    }

    /**
     * 
     * @param {Int} amount
     * 
     * @returns {Object[Array channels,Array eggs]}
     */
    async getData(amount = 2) {
        let possibleChannels = this.possibleChannels.filter(() => true);
        let possibleEggs = this.possibleEggs.filter(() => true);
        const result = {
            channels: [],
            eggs:[]
        };

        for (let i = 0; i < amount; i++) {
            result.channels.push(possibleChannels[Math.ceil(Math.random() * possibleChannels.length) - 1]);
            possibleChannels = possibleChannels.filter(channel => !result.channels.includes(channel));

            result.eggs.push(possibleEggs[Math.ceil(Math.random() * possibleEggs.length) - 1]);
            possibleEggs = possibleEggs.filter(egg => !result.eggs.includes(egg));
        }

        return result;
    }

    /**
     * @param {Object} data
     */
    async process(data) {
        for (let i = 0; i < data.channels.length; i++) {
            const sentMessage = await data.channels[i].send(this.embedCatchTheBunny);
            await sentMessage.react(this.emojiBunnyEars);

            const reactFilter = (reaction) => reaction.emoji.name === this.emojiBunnyEars.name;

            sentMessage.awaitReactions(reactFilter, { time: 10 * SECOND }).then(async collected => {
                if (!collected.first() || !collected.first().users) {
                    sentMessage.reactions.removeAll();
                    return sentMessage.edit(this.embedTheBunnyRunAway);
                }

                let acceptedReactionsCollected = collected.first().users.cache.filter(user => user.id !== sentMessage.author.id);
    
                if (acceptedReactionsCollected.size < 1) {
                    sentMessage.reactions.removeAll();
                    return sentMessage.edit(this.embedTheBunnyRunAway);
                }
    
                const amountToken = Math.ceil(Math.random() * 3);
                let winnersName = '';

                await acceptedReactionsCollected.forEach(async user => {
                    winnersName += ` - ${user.username}`;
                    await MemberToken.add([user.id], amountToken);
                });

                sentMessage.reactions.removeAll();

                return sentMessage.edit(
                    new MessageEmbed()
                        .setDescription(winnersName)
                        .addField(trans('model.easter.foundEasterEgg'), trans('model.easter.eatEasterEgg', [amountToken]))
                        .setThumbnail(data.eggs[i].url)
                );
            });
        }
    }
}

module.exports = new Easter();