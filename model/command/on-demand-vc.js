const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');
const Guild = require('../guild');
const OnDemandVCModel = require('../on-demand-vc');

class OnDemandVC
{
    static instance = null;

    constructor() {
        if (OnDemandVC.instance !== null) {
            return OnDemandVC.instance;
        }

        this.aliases = ['ondemandvc', 'odvc'];
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
            const actions = {'mod': ['lock', 'close', 'unlock', 'open', 'shutdown', 'sync'], 'member': ['limit', 'rename']};
            const emoji = bot.emojis.cache.find(emoji => emoji.name === 'pollyes');
            let success = true;

            if (Guild.isMemberMod(message.member) || Guild.isMemberSoft(message.member)) {
                const validActions = actions['mod'] + actions['member'];
                if (!validActions.includes(action)) {
                    await message.reply(trans('model.command.onDemandVC.error.misused', [Guild.smallVoiceChatRequestChannel.name]));
                    return;
                }

                switch (action) {
                    case 'lock':
                    case 'close':
                        OnDemandVCModel.lockRequestChannel();
                        break;

                    case 'unlock':
                    case 'open':
                        OnDemandVCModel.shutdown = false;
                        OnDemandVCModel.unlockRequestChannel();
                        break;

                    case 'shutdown':
                        OnDemandVCModel.emergencyShutdown();
                        break;

                    case 'sync':
                        OnDemandVCModel.channelHousekeeping();
                        break;

                    case 'limit':
                        success = await OnDemandVCModel.setChannelUserLimit(message.member, args);
                        break;

                    case 'rename':
                        if (args.length > 0) {
                            success = await OnDemandVCModel.renameChannels(message.member, args.join(" "));
                        }
                        break;
                }
            } else {
                const validActions = actions['member'];
                if (!validActions.includes(action)) {
                    await message.reply(trans('model.command.onDemandVC.error.misused', [Guild.smallVoiceChatRequestChannel.name]));
                    return;
                }

                switch (action) {
                    case 'limit':
                        success = await OnDemandVCModel.setChannelUserLimit(message.member, args);
                        break;

                    case 'rename':
                        if (args.length > 0) {
                            success = await OnDemandVCModel.renameChannels(message.member, args.join(" "));
                        }
                        break;
                }
            }

            if (success) {
                await message.react(emoji);
            }
        }
    }
}

module.exports = new OnDemandVC();
