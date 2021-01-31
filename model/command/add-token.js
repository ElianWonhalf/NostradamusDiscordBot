const Logger = require('@lilywonhalf/pretty-logger');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');
const MemberToken = require('../member-token');
const Guild = require('../guild');

class AddToken
{
    static instance = null;

    constructor() {
        if (AddToken.instance !== null) {
            return AddToken.instance;
        }

        this.aliases = [];
        this.category = CommandCategory.RESOURCE;
        this.isAllowedForContext = CommandPermission.isMemberModOrSoftOrAnimator;
    }

    /**
     * @param {Message} message
     */
    async process(message, args) {
        const member = await Guild.getMemberFromMessage(message);
        let searchResult;

        if (args.length > 0) {
            searchResult = Guild.findDesignatedMemberInMessage(message).foundMembers;
        } else if (member.voice.channelID) {
            const activeChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === member.voice.channelID);
            searchResult = activeChannel.members.filter(member => member.id !== message.author.id);
        } else {
            await message.react('❌');
            return;
        }

        await MemberToken.add(searchResult.map(member => member.id)).then(async () => {
            const emoji = bot.emojis.cache.find(emoji => emoji.name === 'kwiziq');

            searchResult.map(async member => {
                await Guild.eventChatChannel.send(`${member.user.username} a gagné un jeton !`);
            });
            await message.react(emoji);
        }).catch(async (error) => {
            await message.react('❌');
            Logger.exception(error);
        });
    }
}

module.exports = new AddToken();
