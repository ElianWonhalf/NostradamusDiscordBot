const Logger = require('@lilywonhalf/pretty-logger');
const Config = require('../../../config.json');
const StatMessages = require('../../stat-messages');
const StatMemberFlow = require('../../stat-member-flow');
const StatVocal = require('../../stat-vocal');
const Correspondence = require('../../correspondence');
const Guild = require('../../guild');

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

/**
 * @param {Message} message
 */
module.exports = async (message) => {
    const member = await Guild.getMemberFromMessage(message);

    if (member.roles.cache.has(Config.roles.corresponding) || member.roles.cache.has(Config.roles.seekingCorrespondence)) {
        message.reply(trans('model.command.correspondence.check.alreadyInCorrespondence'));
    } else {
        const memberJoinedElapsedDays = await getMemberJoinedElapsedDays(member);
        const messagesAmount = (await StatMessages.getAmount(target.id)) + Math.ceil((await StatVocal.getAmount(target.id)) / 60 * 10);

        if (memberJoinedElapsedDays >= Correspondence.constructor.requiredDays && messagesAmount >= Correspondence.constructor.requiredMessageAmount) {
            message.reply(trans('model.command.correspondence.check.eligible', [Guild.correspondenceInformationChannel.toString()]));
        } else {
            message.reply(trans('model.command.correspondence.check.ineligible', [Config.prefix]));
        }
    }
};
