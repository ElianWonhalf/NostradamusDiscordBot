const Logger = require('@lilywonhalf/pretty-logger');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');
const Guild = require('../guild');

class PreventSuicide
{
    static instance = null;

    constructor() {
        if (PreventSuicide.instance !== null) {
            return PreventSuicide.instance;
        }

        this.aliases = ['preventsuicide', 'ps', 'suicide'];
        this.category = CommandCategory.BOT_MANAGEMENT;
        this.isAllowedForContext = CommandPermission.isMemberModOrSoft;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        let member;

        if (message.mentions.members.size > 0) {
            member = message.mentions.members.first();
            args.shift();
        } else if (bot.users.cache.has(args[0])) {
            member = Guild.discordGuild.members.cache.get(args[0]);
        }

        if (member !== null) {
            if (Guild.isMemberNative(member)) {
                member.send(trans('model.command.preventSuicide.native', [member.toString()], 'fr')).then(async () => {
                    await message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollyes'));
                }).catch(async (error) => {
                    Logger.error(error.toString());
                    await message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollno'));
                });
            } else {
                member.send(trans('model.command.preventSuicide.nonNative', [member.toString()])).then(async () => {
                    await message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollyes'));
                }).catch(async (error) => {
                    Logger.error(error.toString());
                    await message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollno'));
                });
            }
        } else {
            await message.reply(trans('model.command.preventSuicide.notFound', [], 'en'));
        }
    }
}

module.exports = new PreventSuicide();
