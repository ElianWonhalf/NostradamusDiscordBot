const Logger = require('@lilywonhalf/pretty-logger');
const Config = require('../../../config.json');
const Correspondence = require('../../correspondence');
const Guild = require('../../guild');

/**
 * @param {Message} message
 */
module.exports = async (message) => {
    const member = await Guild.getMemberFromMessage(message);

    if (member.roles.cache.has(Config.roles.corresponding) || member.roles.cache.has(Config.roles.seekingCorrespondence)) {
        message.reply(trans('model.command.correspondence.check.alreadyInCorrespondence'));
    } else {
        if (Correspondence.isMemberEligible(message.member)) {
            message.reply(trans('model.command.correspondence.check.eligible', [Guild.correspondenceInformationChannel.toString()]));
        } else {
            message.reply(trans('model.command.correspondence.check.ineligible', [Config.prefix]));
        }
    }
};
