const Logger = require('@lilywonhalf/pretty-logger');
const { MessageEmbed } = require('discord.js');
const CommandCategory = require('../command-category');
const { isMommy } = require('../command-permission');
const CommandPermission = require('../command-permission');
const Guild = require('../guild');
const MemberToken = require('../member-token');

/**
 *
 * @param {Array} array 
 */
const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * 
 * @param {Int} amountToken
 * 
 * @returns {Array[amountTicket, tokenToReturn]}
 */
async function tokenToTicket(amountToken) {
    let amountTicket = 0;
    let tokenToReturn = 0;
    let incrValue = 2;

    // 20 first tickets cost 1 token each
    if (amountToken >= 20) {
        amountTicket += 20;
        amountToken -= 20;
    } else if (amountToken > 0) {
        amountTicket += amountToken;
        amountToken = 0;
    }

    // Then ticket cost increase by 1 every 10 tickets (max cost : 3)
    while (amountToken > 0) {
        if (amountToken >= (10 * incrValue)) {
            amountTicket += 10;
            amountToken -= (10 * incrValue);
        } else if (amountToken > 0) {
            amountTicket += Math.floor(amountToken / incrValue);
            tokenToReturn = Math.ceil(amountToken % incrValue);
            amountToken = 0;
        }

        if (incrValue < 3) {
            incrValue++;
        }

        if (amountTicket >= 80) {
            incrValue++;
        }
    }

    return {'amountTicket': amountTicket, 'tokenToReturn': tokenToReturn};
}

class pickWinners
{
    static instance = null;

    constructor() {
        if (pickWinners.instance !== null) {
            return pickWinners.instance;
        }

        this.aliases = ['pickwinners', 'pickw'];
        this.category = CommandCategory.RESOURCE;
        this.isAllowedForContext = CommandPermission.or(CommandPermission.isMommy, CommandPermission.isMemberTokensMastery);
    }

    /**
     * @param {Message} message
     */
    async process(message, args) {
        const emojiPollYes = bot.emojis.cache.find(emoji => emoji.name === 'pollyes');
        const emojiPollNo = bot.emojis.cache.find(emoji => emoji.name === 'pollno');
        const arrayTokenToReturn = [];

        if (arguments.length < 1) {
            return await message.react(emojiPollNo);
        }

        const amountToPick = parseInt(args[0]);

        if (!amountToPick) {
            return await message.react(emojiPollNo);
        }

        const usedTokens = await MemberToken.getUsedTokens();
        let lotteryBox = [];

        await Promise.all(usedTokens.map(async memberUsedTokens => {
            const member = await Guild.discordGuild.members.fetch(memberUsedTokens.user_id).catch(exception => {
                Logger.error(exception.toString());
            });

            const result = await tokenToTicket(memberUsedTokens.amount_used);
            arrayTokenToReturn.push({userId: memberUsedTokens.user_id, amount: result.tokenToReturn});

            if (member) {
                lotteryBox = lotteryBox.concat(new Array(result.amountTicket).fill(member.user));
            }
        }));

        shuffle(lotteryBox);

        const winners = new Array(amountToPick).fill('').map(() => {
            if (lotteryBox.length > 0) {
                let winner = lotteryBox[Math.floor(Math.random() * lotteryBox.length)];

                lotteryBox = lotteryBox.filter(token => token !== winner);

                return winner;
            }
        });

        if (!winners[0]) {
            return await message.react(emojiPollNo);
        }

        const winnersEmbed = new MessageEmbed()
            .setColor('#ffb8e6')
            .setTitle(`🏆 [Winners] 🏆`)
            .setTimestamp(new Date());


        winners.forEach((winner, i) => {
            if (winner) {
                winnersEmbed.addField(`( ${i + 1} )`, `<@${winner.id}> - ${winner.username}#${winner.discriminator}`);
            }
        });

        await message.channel.send(winnersEmbed);

        const sentMessage = await message.channel.send(`Empty the lottery box ?`);
        
        await sentMessage.react(emojiPollYes);
        await sentMessage.react(emojiPollNo);
        
        const reactFilter = (reaction, user) => user.id === message.author.id && (reaction.emoji === emojiPollYes || reaction.emoji === emojiPollNo);
        
        sentMessage.awaitReactions(reactFilter, { max: 1, maxEmojis: 1, time: 15 * MINUTE }).then(async collectedReactions => {
            if (!collectedReactions.first()) {
                sentMessage.reactions.removeAll();
                sentMessage.edit('the lottery box has not been emptied');
            } else {
                await sentMessage.reactions.removeAll();

                if (collectedReactions.first().emoji === emojiPollYes) {
                    await MemberToken.resetUsedTokens();
                    
                    arrayTokenToReturn.forEach(tokenToReturn => {
                        MemberToken.add([tokenToReturn.userId], false, tokenToReturn.amount);
                    });
                    
                    sentMessage.edit('The lottery box has been emptied');
                } else {
                    sentMessage.edit('the lottery box has not been emptied');
                }
            }
        });
    }
}

module.exports = new pickWinners();