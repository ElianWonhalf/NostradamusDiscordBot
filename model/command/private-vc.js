const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');
const Guild = require('../guild');
const PrivateVCModel = require('../private-vc');

class PrivateVC
{
    static instance = null;

    constructor() {
        if (PrivateVC.instance !== null) {
            return PrivateVC.instance;
        }

        this.aliases = ['privatevc', 'pvc'];
        this.category = CommandCategory.MODERATION;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        if (Guild.isMemberMod(message.member) || Guild.isMemberSoft(message.member)) {
            if (args.length > 0) {
                const action = args.shift().toLowerCase();
                const emoji = bot.emojis.cache.find(emoji => emoji.name === 'pollyes');

                switch (action) {
                    case 'lock':
                    case 'close':
                        PrivateVCModel.lockRequestChannel();
                        break;

                    case 'unlock':
                    case 'open':
                        PrivateVCModel.shutdown = false;
                        PrivateVCModel.unlockRequestChannel();
                        break;

                    case 'shutdown':
                        PrivateVCModel.emergencyShutdown();

                    default:
                        message.reply(trans('model.command.privateVC.error.unknownAction', [action], 'en'));
                }

                await message.react(emoji);
            } else {
                message.reply(trans('model.command.privateVC.error.missingAction', [], 'en'));
            }
        } else {
            message.reply(trans('model.command.privateVC.error.misused', [Guild.smallVoiceChatRequestChannel.name]));
        }
    }
}

module.exports = new PrivateVC();
