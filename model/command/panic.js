const Logger = require('@lilywonhalf/pretty-logger');
const Config = require('../../config.json');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class Panic
{
    static instance = null;

    constructor() {
        if (Panic.instance !== null) {
            return Panic.instance;
        }

        this.aliases = [];
        this.category = CommandCategory.ADMINISTRATION;
        this.isAllowedForContext = CommandPermission.isMemberMod;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        const panicOverWords = [
            'off',
            'over',
            'done',
            'stop',
            'calm',
            'fini',
            'finie',
            'passé',
            'passée',
            'arrête',
            'arrete',
            'arrêter',
            'arreter',
            'calm',
            'calme',
            'calmer'
        ];
        const enabled = args.length < 1 || panicOverWords.indexOf(args[0]) < 0;
        const officialMemberRole = Guild.discordGuild.roles.cache.get(Config.roles.officialMember);

        Logger.warning(`${enabled ? 'Entering' : 'Leaving'} server panic mode (called by ${message.author.username})`);
        let permissions = officialMemberRole.permissions;

        if (enabled) {
            permissions = permissions.remove('SEND_MESSAGES');
        } else {
            permissions = permissions.add('SEND_MESSAGES');
        }

        officialMemberRole.setPermissions(permissions);
        Logger.warning((enabled ? 'Entered' : 'Left') + ' server panic mode');
    }
}

module.exports = new Panic();
