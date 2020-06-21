const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class GetMemberId
{
    static instance = null;

    constructor() {
        if (GetMemberId.instance !== null) {
            return GetMemberId.instance;
        }

        this.aliases = ['getmemberid', 'getuserid', 'memberid', 'userid', 'gmid', 'guid'];
        this.category = CommandCategory.MODERATION;
        this.isAllowedForContext = CommandPermission.isMemberMod;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        const result = Guild.findDesignatedMemberInMessage(message);

        if (result.foundMembers.length > 0) {
            message.channel.send(result.foundMembers[0].toString());
            message.channel.send(result.foundMembers[0].id);
        } else {
            message.reply(trans('model.command.getMemberId.notFound', [], 'en'));
        }
    }
}

module.exports = new GetMemberId();
