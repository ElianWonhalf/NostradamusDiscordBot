const Discord = require('discord.js');
const Logger = require('@elian-wonhalf/pretty-logger');
const Config = require('../../config.json');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

// Including every model here so that it's ready to be used by the command
const Blacklist = require('../blacklist');
const Country = require('../country');
const Db = require('../db');
const DM = require('../dm');
const GoogleTranslateToken = require('../google-translate-token');
const Guild = require('../guild');
const HardcoreLeaning = require('../hardcore-learning');
const Language = require('../language');
const MemberRolesFlow = require('../member-roles-flow');
const ModerationLog = require('../moderation-log');
const SocialNetworkIntegration = require('../social-network-integration');
const Translator = require('../translator');
const TwitterUtils = require('../twitter-utils');
const VoiceSynthesizer = require('../voice-synthesizer');
const WatchedMember = require('../watched-member');

const JAVASCRIPT_LOGO_URL = 'https://i.discord.fr/IEV8.png';

/**
 * @param {Message} message
 */
module.exports = {
    aliases: [],
    category: CommandCategory.BOT_MANAGEMENT,
    isAllowedForContext: CommandPermission.isMommy,
    process: async (message) => {
        const emoji = bot.emojis.cache.find(emoji => emoji.name === 'eowynsheep');
        const code = message.content
            .substr(Config.prefix.length + 'eval'.length)
            .trim()
            .replace(/(`{3})js\n(.+)\n\1/iu, '$2')
            .trim();

        await message.react(emoji);
        Logger.notice('Eval: ' + code);
        let output = null;

        try {
            output = eval(code); // Spoopy! 🎃 🦇 👻 ☠ 🕷
        } catch (exception) {
            output = `**${exception.name}: ${exception.message}**\n${exception.stack}`;
        }

        const embed = new Discord.MessageEmbed()
            .setAuthor('Eval', JAVASCRIPT_LOGO_URL)
            .setColor(0x00FF00)
            .setDescription(output);

        message.channel.send(embed);
    }
};
