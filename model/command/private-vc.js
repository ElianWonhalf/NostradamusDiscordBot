const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');
const PrivateVC = require('../private-vc');

class PrivateVc
{
    static instance = null;

    constructor() {
        if (PrivateVc.instance !== null) {
            return PrivateVc.instance;
        }

        this.aliases = ['privatevc', 'pvc'];
        this.category = CommandCategory.MODERATION;
        this.isAllowedForContext = CommandPermission.isMemberModOrSoft;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        if (args.length > 0) {
            const action = args.shift().toLowerCase();

            switch (action) {
                case 'lock':
                case 'close':
                    PrivateVC.lockRequestChannel();
                    break;

                case 'unlock':
                case 'open':
                    PrivateVC.shutdown = false;
                    PrivateVC.unlockRequestChannel();
                    break;

                case 'shutdown':
                    PrivateVC.emergencyShutdown();
            }
        } else {
            message.reply(trans('model.command.privateVc.error.missingAction', [], 'en'));
        }
    }
}

module.exports = new PrivateVc();
