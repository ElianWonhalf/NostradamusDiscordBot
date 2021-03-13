const Logger = require('@lilywonhalf/pretty-logger');
const { Permissions } = require('discord.js');
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
        this.isAllowedForContext = CommandPermission.isMommy;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        if (message.channel.type === 'dm') {
            return;
        }
        
        const emojiPollNo = bot.emojis.cache.find(emoji => emoji.name === 'pollno');
        const member = await Guild.getMemberFromMessage(message);
        let searchResult;
        let amount = 1;

        if (args[args.length - 1] && parseInt(args[args.length - 1]) && parseInt(args[args.length - 1]) < 10000) {
            amount = parseInt(args[args.length - 1]);
        }

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

            searchResult = searchResult.array();
        } else {
            return message.react(emojiPollNo);
        }

        if (searchResult.length < 1) {
            return message.react(emojiPollNo);
        }

        await MemberToken.add(searchResult.map(member => member.id), amount).then(async () => {
            const emoji = bot.emojis.cache.find(emoji => emoji.name === 'kwiziq');
            const chatPermissionOverwrites = Guild.eventChatChannel.permissionOverwrites.get(Guild.discordGuild.roles.everyone.id);

            if (!chatPermissionOverwrites || !chatPermissionOverwrites.deny.has(Permissions.FLAGS.VIEW_CHANNEL)) {
                searchResult = searchResult.map(member => member.displayName);

                await Guild.eventChatChannel.send(
                    `${trans('model.command.addToken.notification', [amount])}\n${searchResult.join(', ')}`
                );
            }

            await message.react(emoji);
        }).catch(async (error) => {
            await message.react(emojiPollNo);
            Logger.exception(error);
        });
    }
}

module.exports = new AddToken();
