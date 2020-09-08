const Config = require('../../config.json');
const Guild = require('../guild');
const Heat = require('../heat');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

const destinations = {
    'class': 'class',
    'classe': 'class',
    'sdc': 'class',
    'salle de classe': 'class',
    'salledeclasse': 'class',
    'classroom': 'class',
    'chat': 'chat',
    'francais': 'chat',
    'français': 'chat',
    'anglais': 'chat',
    'discussion': 'chat',
    'discussions': 'chat',
    'conversation': 'chat',
    'conversations': 'chat'
};

class Redirect extends Heat
{
    static instance = null;

    constructor() {
        if (Redirect.instance !== null) {
            return Redirect.instance;
        }

        super(10 * SECOND);
        this.aliases = ['redir'];
        this.category = CommandCategory.RESOURCE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        if (this.canCall()) {
            this.registerCall();
            if (args.length < 1) {
                message.channel.send(trans('model.command.redirect.toClassrooms', [Guild.mainClassroomChannel.toString()]));

                return;
            }

            const lowercaseArgs = args.join(' ').toLowerCase();

            if (!Object.keys(destinations).includes(lowercaseArgs)) {
                message.reply(
                    trans('model.command.redirect.unknownDest', [Config.prefix, Config.prefix])
                );

                return;
            }

            message.delete();

            if (destinations[lowercaseArgs] === 'chat') {
                message.channel.send(trans('model.command.redirect.toChatRooms', [Guild.learntLanguageChannel.toString(), Guild.otherLanguageChannel.toString()]));
            } else {
                message.channel.send(trans('model.command.redirect.toClassrooms', [Guild.mainClassroomChannel.toString()]));
            }
        } else {
            message.react('⌛');
        }
    }
}

module.exports = new Redirect();
