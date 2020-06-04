const fs = require('fs');
const Discord = require('discord.js');
const Config = require('../config.json');
const Guild = require('./guild');

const cachelessRequire = (path) => {
    delete require.cache[require.resolve(path)];

    return require(path);
};

const Command = {
    commandList: new Discord.Collection(),
    commandAliases: {},

    init: () => {
        Command.commandList = new Discord.Collection();
        Command.commandAliases = {};

        fs.readdirSync('model/command/').forEach(file => {
            if (file.substr(file.lastIndexOf('.')).toLowerCase() === '.js') {
                const commandPath = `./command/${file}`;
                const commandInstance = cachelessRequire(commandPath);
                const commandName = file.substr(0, file.lastIndexOf('.')).toLowerCase();

                Command.commandList.set(commandName, commandPath);

                if (commandInstance.aliases !== undefined && commandInstance.aliases !== null) {
                    commandInstance.aliases.forEach(alias => {
                        Command.commandAliases[alias.toLowerCase()] = commandName;
                    });
                }
            }
        });
    },

    /**
     * @param {Message} message
     * @returns {boolean}
     */
    parseMessage: async (message) => {
        let isCommand = false;

        if (message.content.toLowerCase().substr(0, Config.prefix.length) === Config.prefix) {
            let content = message.content.substr(Config.prefix.length).trim().split(' ');
            const calledCommand = content.shift().toLowerCase();

            if (await Command.isValid(calledCommand, message)) {
                const member = await Guild.getMemberFromMessage(message);

                if (member === null) {
                    message.reply(trans('model.command.notOnServer'));
                } else {
                    let commandName = calledCommand;
                    isCommand = true;

                    if (Command.commandAliases.hasOwnProperty(calledCommand)) {
                        commandName = Command.commandAliases[calledCommand];
                    }

                    cachelessRequire(Command.commandList.get(commandName)).process(message, content, Command);
                }
            }
        }

        return isCommand;
    },

    /**
     * @param {string} command
     * @param {Message} message
     * @return {Promise.<boolean>}
     */
    isValid: async (command, message) => {
        let canonicalCommand = command.toLowerCase();
        let valid = Command.commandList.has(canonicalCommand);

        if (!valid && Command.commandAliases.hasOwnProperty(canonicalCommand)) {
            canonicalCommand = Command.commandAliases[command];
            valid = Command.commandList.has(canonicalCommand);
        }

        valid = valid
            && Config.disabledCommands.indexOf(canonicalCommand) < 0
            && await cachelessRequire(Command.commandList.get(canonicalCommand)).isAllowedForContext(message);

        return valid;
    }
};

module.exports = Command;
