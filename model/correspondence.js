const Logger = require('@lilywonhalf/pretty-logger');
const Guild = require('./guild');
const StatMessages = require('./stat-messages');
const StatMemberFlow = require('./stat-member-flow');
const StatVocal = require('./stat-vocal');

const REQUIRED_DAYS = 10;
const REQUIRED_MESSAGE_AMOUNT = 100;
const CORRESPONDENCE_RELATED_REGEXP = /correspond[ea]nce|syst[èe]me?|penpal/gu;

/**
 * @param {GuildMember} member
 * @returns {Promise.<string>}
 */
const getMemberJoinedElapsedDays = async (member) => {
    const firstMessageDate = await StatMessages.getFirstMessageDate(member.id);
    const savedJoinDate = await StatMemberFlow.getFirstJoinedDate(member.id);
    let joinDate = member.user ? member.joinedAt : null;

    if (firstMessageDate !== undefined && (joinDate === null || firstMessageDate.getTime() < joinDate.getTime())) {
        joinDate = firstMessageDate;
    }

    let joinDateWithoutTime = null;

    if (joinDate !== null) {
        joinDateWithoutTime = new Date(joinDate.getTime());
        joinDateWithoutTime.setHours(0);
        joinDateWithoutTime.setMinutes(0);
        joinDateWithoutTime.setSeconds(0);
        joinDateWithoutTime.setMilliseconds(0);
    }

    if (savedJoinDate !== null && (joinDateWithoutTime === null || savedJoinDate.getTime() < joinDateWithoutTime.getTime())) {
        joinDate = savedJoinDate;
    }

    if (joinDate !== null) {
        const elapsedTime = (new Date().getTime() - joinDate.getTime()) / 1000;

        return Math.ceil(elapsedTime / 60 / 60 / 24);
    } else {
        return 0;
    }
};

class Correspondence
{
    /**
     * @param {Snowflake} snowflake
     * @returns {Message|null}
     */
    async findIntroduction(snowflake)
    {
        const learnersMessages = await Guild.fetchAllChannelMessages(Guild.correspondenceLearnersChannel, true);
        let introduction = learnersMessages.find(
            message => message.mentions.users.some(user => user.id === snowflake)
        );

        if (!introduction) {
            const nativesMessages = await Guild.fetchAllChannelMessages(Guild.correspondenceNativesChannel, true);
            introduction = nativesMessages.find(
                message => message.mentions.users.some(user => user.id === snowflake)
            );
        }

        return introduction || null;
    }

    /**
     * @param {GuildMember} member
     * @returns {boolean}
     */
    async isMemberEligible(member)
    {
        const messagesAmount = await StatMessages.getAmount(member.id);
        const vocalTime = await StatVocal.getAmount(member.id);

        const memberJoinedElapsedDays = await getMemberJoinedElapsedDays(member);
        const calculatedMessagesAmount = messagesAmount + Math.ceil(vocalTime / 60 * 10);

        return memberJoinedElapsedDays >= REQUIRED_DAYS && calculatedMessagesAmount >= REQUIRED_MESSAGE_AMOUNT;
    }

    /**
     * @param {String} string
     * @returns {boolean}
     */
    isStringAboutCorrespondence(string)
    {
        return CORRESPONDENCE_RELATED_REGEXP.test(string);
    }
}

module.exports = new Correspondence();
