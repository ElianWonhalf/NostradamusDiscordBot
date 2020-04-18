const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

/**
 * @param {Message} message
 */
module.exports = {
    aliases: [],
    category: CommandCategory.MODERATION,
    isAllowedForContext: CommandPermission.memberHasPermission('MOVE_MEMBERS'),
    process: async (message) => {
        const member = await Guild.getMemberFromMessage(message);

        Guild.addMemberToVoiceStateUpdateWatcher(member.id, setTimeout(() => {
            Guild.removeMemberFromVoiceStateUpdateWatcher(member.id);
            message.reply(trans('model.command.voicemove.timeout', [], 'en'));
        }, 5 * 60 * 1000));

        message.reply(trans('model.command.voicemove.ready', [], 'en'));
    }
};
