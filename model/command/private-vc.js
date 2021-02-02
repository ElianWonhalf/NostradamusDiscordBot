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
        if (args.length > 0) {
            const action = args.shift().toLowerCase();
            const actions = {'mod': ['lock', 'close', 'unlock', 'open', 'shutdown'], 'member': ['rename']};
            const emoji = bot.emojis.cache.find(emoji => emoji.name === 'pollyes');

            if (Guild.isMemberMod(message.member) || Guild.isMemberSoft(message.member)) {
                const validActions = actions['mod'] + actions['member'];
                if (!validActions.includes(action)) {
                    await message.reply(trans('model.command.privateVC.error.misused', [Guild.smallVoiceChatRequestChannel.name]));
                    return;
                }

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
                        break;

                    case 'rename':
                        if (args.length > 0) {
                            PrivateVCModel.renameChannels(message.member, args.join(" "));
                        }
                        break;
                }
            } else {
                const validActions = actions['member'];
                if (!validActions.includes(action)) {
                    await message.reply(trans('model.command.privateVC.error.misused', [Guild.smallVoiceChatRequestChannel.name]));
                    return;
                }

                switch (action) {
                    case 'rename':
                        if (args.length > 0) {
                            PrivateVCModel.renameChannels(message.member, args.join(" "));
                        }
                        break;
                }
            }

            await message.react(emoji);
        }
    }
}

module.exports = new PrivateVC();
