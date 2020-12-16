const Logger = require('@lilywonhalf/pretty-logger');
const Config = require('../../../config.json');
const Correspondence = require('../../correspondence');
const Guild = require('../../guild');

/**
 * @param {Message} message
 */
module.exports = async (message) => {
    const membersToMessage = Guild.findDesignatedMemberInMessage(message);
    let member, self;

    if (membersToMessage.certain === true && membersToMessage.foundMembers.length > 0) {
        member = membersToMessage.foundMembers[0];
        self = false;
    } else {
        member = await Guild.getMemberFromMessage(message);
        self = true;
    }

    if (member.roles.cache.has(Config.roles.corresponding) || member.roles.cache.has(Config.roles.seekingCorrespondence)) {
        message.reply(trans('model.command.correspondence.check.alreadyInCorrespondence'));
    } else {
        if (await Correspondence.isMemberEligible(member)) {
            const vars = [Guild.correspondenceInformationChannel.toString()];

            if (!self) {
                vars.unshift(member.toString());
            }

            message.reply(trans(`model.command.correspondence.check.${self ? 'selfEligible' : 'eligible'}`, vars));
        } else {
            const vars = [Config.prefix];

            if (!self) {
                vars.pop();
                vars.unshift(member.toString());
            }

            message.reply(trans(`model.command.correspondence.check.${self ? 'selfIneligible' : 'ineligible'}`, vars));
        }
    }
};
