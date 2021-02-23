const Discord = require('discord.js');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

/**
 * @param {Array} members 
 * @param {int} amount 
 * 
 * @return {Array}
 */
function getMembersToDisplay(members, amount = 5) {
    return members.slice(0, 5);
}

/**
 * @param {Message} message 
 * @param {Array} emojis 
 */
function addReactions(message, emojis) {
    if (message && emojis.length > 0) {
        emojis.forEach(emoji => {
            message.react(emoji);
        });
    }
}

/**
 * @param {Array} messages 
 */
function deleteMessages(messages) {
    if (messages.length > 0) {
        messages.forEach(message => {
            message.delete();
        });
    }
}

class GetMemberId
{
    static instance = null;

    constructor() {
        if (GetMemberId.instance !== null) {
            return GetMemberId.instance;
        }

        this.aliases = ['getmemberid', 'getuserid', 'memberid', 'userid', 'gmid', 'guid'];
        this.category = CommandCategory.MODERATION;
        this.isAllowedForContext = CommandPermission.isMemberModOrSoft;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        const result = Guild.findDesignatedMemberInMessage(message);
        const foundMembers = result.foundMembers.filter(member => member.guild !== undefined && isRightGuild(member.guild.id));

        let membersToDisplay = getMembersToDisplay(foundMembers, 5);

        if (membersToDisplay.length > 0) {
            const sentMessages = [];

            await Promise.all(membersToDisplay.map(async member => {
                const user = member.user;
                const embed = new Discord.MessageEmbed()
                    .setAuthor(`${user.username}#${user.discriminator}`, user.displayAvatarURL({ dynamic: true }))
                    .setDescription(`${member}`)
                    .setFooter(`${member.id}`)
                    .setColor(0x00FF00);

                let sentMessage = await message.channel.send(embed);
                sentMessages.push(sentMessage);
            }));

            const acceptedReactEmojis = ['🗑'];

            addReactions(sentMessages[sentMessages.length - 1], acceptedReactEmojis);
            
            const reactFilter = (reaction, user) => user.id === message.author.id && acceptedReactEmojis.includes(reaction.emoji.name);

            sentMessages[sentMessages.length - 1].awaitReactions(reactFilter, { max: 1, maxEmojis: 1, time: 300000 }).then(async collectedReactions => {
                if (!collectedReactions.first()) {
                    sentMessages.reactions.removeAll();
                } else {
                    deleteMessages(sentMessages);
                }
            });
        } else {
            message.reply(trans('model.command.getMemberId.notFound', [], 'en'));
        }
    }
}

module.exports = new GetMemberId();