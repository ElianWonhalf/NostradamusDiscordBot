const Config = require('../../config.json');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class VoiceTextVisibility
{
    static instance = null;

    constructor() {
        if (VoiceTextVisibility.instance !== null) {
            return VoiceTextVisibility.instance;
        }

        this.aliases = ['voice-text', 'vtv'];
        this.category = CommandCategory.ROLE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        const member = await Guild.getMemberFromMessage(message);

        if (member.roles.cache.has(Config.roles.voiceTextVisibility)) {
            member.roles.remove(Config.roles.voiceTextVisibility).then(() => {
                message.reply(trans('model.command.voiceTextVisibility.hidden', [Guild.otherLanguageChannel]));
            });
        } else {
            member.roles.add(Config.roles.voiceTextVisibility).then(() => {
                message.reply(trans('model.command.voiceTextVisibility.visible', [Guild.otherLanguageChannel]));
            });
        }
    }
}

module.exports = new VoiceTextVisibility();
