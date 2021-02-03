const Logger = require('@lilywonhalf/pretty-logger');
const Discord = require('discord.js');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

const arrayEmojis = [];
arrayEmojis.push('🔎');
arrayEmojis.push(bot.emojis.cache.find(emoji => emoji.name === 'foxlong1'));
arrayEmojis.push(bot.emojis.cache.find(emoji => emoji.name === 'foxlong2'));
arrayEmojis.push(bot.emojis.cache.find(emoji => emoji.name === 'foxlong3'));

class XofYkcul
{
    static instance = null;

    constructor() {
        if (XofYkcul.instance !== null) {
            return XofYkcul.instance;
        }

        this.aliases = [];
        this.category = CommandCategory.RESOURCE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        message.channel.send('? yas uoy did tahw ,yrroS').then(message => arrayEmojis.map(emoji => message.react(emoji)));
    }
}

module.exports = new XofYkcul();
