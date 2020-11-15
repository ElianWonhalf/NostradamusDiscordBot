const { MessageEmbed } = require('discord.js');
const Logger = require('@lilywonhalf/pretty-logger');
const Trello = require('../../trello');

const getMembers = async () => {
    const members = {};
    const membersData = await Trello.call(`boards/${Trello.ID_BOARD_FRENCH}/members`);

    if (membersData) {
        membersData.forEach((member) => {
            members[member.id] = member;
        });

        const membershipsData = await Trello.call(`boards/${Trello.ID_BOARD_FRENCH}/memberships`);

        if (membershipsData) {
            membershipsData.forEach(membership => {
                if (membership.memberType === 'visitor' || membership.deactivated === true) {
                    delete members[membership.idMember];
                }
            });
        }
    }

    return members;
};

const getVoteCards = () => {
    return Trello.call(`lists/${Trello.ID_LIST_VOTES}/cards`);
};

const getVotes = (voteCardId) => {
    return Trello.call(`cards/${voteCardId}/pluginData`);
};

module.exports = async (message) => {
    const members = await getMembers().catch(() => {
        message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollno'));
    });
    const voteCards = await getVoteCards().catch(() => {
        message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollno'));
    });

    if (members && voteCards) {
        if (voteCards.length > 0) {
            await Promise.all(voteCards.map(async voteCard => {
                const votesData = await getVotes(voteCard.id).catch(() => {
                    message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollno'));
                });
                let shouldVote = Object.values(members).map(member => member.fullName);

                if (votesData.length > 0) {
                    const votes = Object.keys(JSON.parse(votesData[0].value).votes);
                    const memberIds = Object.keys(members);

                    shouldVote = memberIds.filter(memberId => !votes.includes(memberId)).map(memberId => members[memberId].fullName);
                }

                if (shouldVote.length > 0) {
                    const embed = new MessageEmbed()
                        .setTitle(voteCard.name)
                        .setURL(voteCard.shortUrl)
                        .setDescription(shouldVote.join(', '))
                        .setColor(0x00FF00);

                    await message.channel.send(embed);
                }
            }));
        } else {
            await message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollyes'));
        }
    }
};
