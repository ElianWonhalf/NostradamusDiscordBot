const fs = require('fs');
const Config = require('../config.json');
const Guild = require('./guild');

const Command = {
    commandAliases: {},

    init: () => {
        fs.readdirSync('model/command/').forEach(file => {
            if (file.substr(file.lastIndexOf('.')).toLowerCase() === '.js') {
                const commandInstance = require(`./command/${file}`);
                const commandName = file.substr(0, file.lastIndexOf('.'));

                if (commandInstance.aliases !== undefined && commandInstance.aliases !== null) {
                    commandInstance.aliases.forEach(alias => {
                        Command.commandAliases[alias.toLowerCase()] = commandName;
                    })
                }
            }
        });
    },

    /**
     * @param {Message} message
     * @returns {boolean}
     */
    parseMessage: (message) => {
        let isCommand = false;

        if (message.content.toLowerCase().substr(0, Config.prefix.length) === Config.prefix) {
            let content = message.content.substr(Config.prefix.length).trim().split(' ');
            const calledCommand = content.shift().toLowerCase();

            if (Command.isValid(calledCommand)) {
                const member = Guild.getMemberFromMessage(message);

                if (member === null) {
                    message.reply(`\n${trans('model.command.notOnServer')}`);
                } else {
                    let commandName = calledCommand;
                    isCommand = true;

                    if (Command.commandAliases.hasOwnProperty(calledCommand)) {
                        commandName = Command.commandAliases[calledCommand].toLowerCase();
                    }

                    (require('./command/' + commandName + '.js')).process(message, content);
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

        if (!valid && Command.commandAliases.hasOwnProperty(command)) {
            valid = fs.existsSync('model/command/' + Command.commandAliases[command].toLowerCase() + '.js');
            canonicalCommand = Command.commandAliases[command].toLowerCase();
        }

        valid = valid && Config.disabledCommands.indexOf(canonicalCommand) < 0;

        return valid;
    }
};

module.exports = Command;
