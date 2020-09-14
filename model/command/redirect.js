const Config = require('../../config.json');
const Guild = require('../guild');
const Heat = require('../heat');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

const classrooms = [
    Config.channels.classroom1,
    Config.channels.classroom2,
    Config.channels.classroom3,
    Config.channels.explicitClassroom
];

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
     */
    async process(message) {
        if (this.canCall()) {
            this.registerCall();
            message.delete();

            if (classrooms.includes(message.channel.id)) {
                message.channel.send(
                    trans(
                        'model.command.redirect.toChatRooms',
                        [Guild.learntLanguageChannel.toString(), Guild.otherLanguageChannel.toString()]
                    )
                );
            } else if (Config.channelCategories.vocal.includes(message.channel.parent.id)) {
                message.channel.send(
                    trans(
                        'model.command.redirect.fromVocal',
                        [
                            Guild.learntLanguageChannel.toString(),
                            Guild.otherLanguageChannel.toString(),
                            Guild.classroom3Channel.toString()
                        ]
                    )
                );
            } else {
                message.channel.send(
                    trans(
                        'model.command.redirect.toClassrooms',
                        [Guild.classroom3Channel.toString()]
                    )
                );
            }
        } else {
            message.react('⌛');
        }
    }
}

module.exports = new Redirect();
