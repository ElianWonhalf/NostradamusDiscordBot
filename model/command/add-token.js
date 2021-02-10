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

        this.aliases = ['addtoken', 'addt'];
        this.category = CommandCategory.RESOURCE;
        this.isAllowedForContext = CommandPermission.isMemberModOrSoftOrAnimator;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        const emojiPollNo = bot.emojis.cache.find(emoji => emoji.name === 'pollno');
        const member = await Guild.getMemberFromMessage(message);
        let searchResult;

        if (args.length > 0) {
            searchResult = Guild.findDesignatedMemberInMessage(message).foundMembers.filter(member => member.user);
        } else if (member.voice.channelID) {
            const eventChannels = Guild.eventCategoryChannel.children;
            const activeChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === member.voice.channelID);

            searchResult = activeChannel.members.filter(member => member.id !== message.author.id);

            eventChannels.forEach(channel => {
                if (channel.id !== activeChannel.id && channel.type  === 'voice') {
                    channel.members.forEach(member => {
                        searchResult.set(member.user.id, member);
                    });
                }
            });
        } else {
            return message.react(emojiPollNo);
        }

        if (!searchResult.first()) {
            return message.react(emojiPollNo);
        }

        await MemberToken.add(searchResult.map(member => member.id)).then(async () => {
            const emoji = bot.emojis.cache.find(emoji => emoji.name === 'kwiziq');

            searchResult = searchResult.map(member => member.displayName);

            await Guild.eventChatChannel.send(
                `${trans('model.command.addToken.notification')}\n${searchResult.join(', ')}`
            );

            await message.react(emoji);
        }).catch(async (error) => {
            await message.react(emojiPollNo);
            Logger.exception(error);
        });
    }
}

module.exports = new AddToken();
