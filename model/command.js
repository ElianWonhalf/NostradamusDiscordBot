const fs = require('fs');
const Config = require('../config.json');
const Guild = require('./guild');
let commandAliases = {
    'reboot': 'reload',

    'rank': 'level',

    'pays': 'country',

    'langue': 'language',
    'langage': 'language',

    'rp': 'report',
    'rep': 'report',

    'miniclass': 'mini-class',
    'miniclasse': 'mini-class',
    'mini-classe': 'mini-class',

    'loadroles': 'load-roles',

    'modlist': 'mod-list',
    'mod': 'mod-list',
    'modo': 'mod-list',
    'mods': 'mod-list',
    'modos': 'mod-list',
    'modérateur': 'mod-list',
    'modérateurs': 'mod-list',
    'moderateur': 'mod-list',
    'moderateurs': 'mod-list',
    'moderator': 'mod-list',
    'moderators': 'mod-list',

    'comitee': 'committee',
    'commitee': 'committee',
    'comittee': 'committee',
    'committe': 'committee',
    'comite': 'committee',
    'comité': 'committee',

    'addlanguage': 'add-language',

    'addcountry': 'add-country',

    'setavatar': 'set-avatar',

    'dictee': 'dictation',
    'dictée': 'dictation',

    'tuteur': 'tutors',
    'tuteurs': 'tutors',
    'tutor': 'tutors',

    'outloudreading': 'out-loud-reading',
    'reading': 'out-loud-reading',
    'readingoutloud': 'out-loud-reading',
    'lecture-à-voix-haute': 'out-loud-reading',
    'lecture-a-voix-haute': 'out-loud-reading',
    'lectureàvoixhaute': 'out-loud-reading',
    'lectureavoixhaute': 'out-loud-reading',
    'lecture': 'out-loud-reading',
    'lecturevoixhaute': 'out-loud-reading',
    'lecture-voix-haute': 'out-loud-reading',

    'game': 'games',
    'jeu': 'games',
    'jeux': 'games',
};
commandAliases[Config.levelCommand] = 'level';

const Command = {
    /**
     * @param {Message} message
     * @returns {boolean}
     */
    parseMessage: (message) => {
        let isCommand = false;

        if (message.content.toLowerCase().substr(0, Config.prefix.length) === Config.prefix) {
            let content = message.content.substr(Config.prefix.length).trim().split(' ');
            const command = content.shift().toLowerCase();

            if (Command.isValid(command)) {
                const member = Guild.getMemberFromMessage(message);

                if (member === null) {
                    message.reply(`\n${trans('model.command.notOnServer')}`);
                } else {
                    isCommand = true;

                    if (commandAliases.hasOwnProperty(command)) {
                        (require('./command/' + commandAliases[command].toLowerCase() + '.js'))(message, content);
                    } else {
                        (require('./command/' + command + '.js'))(message, content);
                    }
                }
            }
        }

        return isCommand;
    },

    /**
     * @param {string} command
     * @return {boolean}
     */
    isValid: (command) => {
        let valid = fs.existsSync('model/command/' + command.toLowerCase() + '.js');
        let canonicalCommand = command.toLowerCase();

        if (!valid && commandAliases.hasOwnProperty(command)) {
            valid = fs.existsSync('model/command/' + commandAliases[command].toLowerCase() + '.js');
            canonicalCommand = commandAliases[command].toLowerCase();
        }

        valid = valid && Config.disabledCommands.indexOf(canonicalCommand) < 0;

        return valid;
    }
};

module.exports = Command;
