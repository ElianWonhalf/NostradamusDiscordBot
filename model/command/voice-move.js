const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class VoiceMove
{
    static instance = null;

    constructor() {
        if (VoiceMove.instance !== null) {
            return VoiceMove.instance;
        }

        this.aliases = ['voicemove'];
        this.category = CommandCategory.MODERATION;
        this.isAllowedForContext = CommandPermission.memberHasPermission('MOVE_MEMBERS');
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        const member = await Guild.getMemberFromMessage(message);

        Guild.addMemberToVoiceStateUpdateWatcher(member.id, setTimeout(() => {
            Guild.removeMemberFromVoiceStateUpdateWatcher(member.id);
            message.reply(trans('model.command.voicemove.timeout', [], 'en'));
        }, 5 * 60 * 1000));

        message.reply(trans('model.command.voicemove.ready', [], 'en'));
    }
}

module.exports = new VoiceMove();
