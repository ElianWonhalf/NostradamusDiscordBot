const { User } = require('discord.js');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');
const Guild = require('../guild');

const cachelessRequire = (path) => {
    if (typeof path === 'string') {
        delete require.cache[require.resolve(path)];
    }

    return typeof path === 'string' ? require(path) : null;
};

class Info
{
    static instance = null;

    constructor() {
        if (Info.instance !== null) {
            return Info.instance;
        }

        this.aliases = ['whois', 'information', 'informations', 'who'];
        this.category = CommandCategory.BOT_MANAGEMENT;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        const result = await Guild.findDesignatedMemberInMessage(message);
        let target = null;

        if (!result.certain && args.length < 1) {
            result.certain = true;
            result.foundMembers.push(await Guild.discordGuild.members.fetch(message.author));
        }

        try {
            target = await Guild.discordGuild.members.fetch(result.foundMembers[0].id);
        } catch (error) {
            try {
                target = bot.users.cache.get(result.foundMembers[0].id);
            } catch (error) {
                target = null;

                if (message.content.match(/[0-9]{16,19}/u) !== null) {
                    const ids = message.content.match(/[0-9]{16,19}/gu);
                    target = new User(bot, { id: ids[0], bot: false });
                }
            }
        }

        const action = args.length > 0 ? args.shift() : 'info';

        switch (action) {
            case 'username':
                (cachelessRequire('./info/usernames.js'))(message, target);
                break;

            case 'nickname':
                (cachelessRequire('./info/nicknames.js'))(message, target);
                break;

            case 'avatar':
                (cachelessRequire('./info/avatars.js'))(message, target);
                break;

            case 'info':
            case 'usernames':
            case 'nicknames':
            case 'avatars':
                (cachelessRequire('./info/' + action + '.js'))(message, target);
                break;

            default:
                (cachelessRequire('./info/info.js'))(message, target);
                break;
        }
    }
}

module.exports = new Info();
