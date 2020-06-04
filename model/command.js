const fs = require('fs');
const Discord = require('discord.js');
const Config = require('../config.json');
const Guild = require('./guild');

const cachelessRequire = (path) => {
    if (typeof path === 'string') {
        delete require.cache[require.resolve(path)];
    }

    return typeof path === 'string' && fs.existsSync(path) ? require(path) : null;
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

                if (commandInstance !== null) {
                    const commandName = file.substr(0, file.lastIndexOf('.')).toLowerCase();

                    Command.commandList.set(commandName, commandPath);

                    if (commandInstance.aliases !== undefined && commandInstance.aliases !== null) {
                        commandInstance.aliases.forEach(alias => {
                            Command.commandAliases[alias.toLowerCase()] = commandName;
                        });
                    }
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

                    const commandInstance = cachelessRequire(Command.commandList.get(commandName));

                    if (commandInstance !== null) {
                        commandInstance.process(message, content, Command);
                    } else {
                        Command.commandList.delete(commandName);
                    }
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

        const commandInstance = cachelessRequire(Command.commandList.get(canonicalCommand));

        if (commandInstance === null) {
            Command.commandList.delete(canonicalCommand);
        }

        valid = valid
            && Config.disabledCommands.indexOf(canonicalCommand) < 0
            && commandInstance !== null
            && await commandInstance.isAllowedForContext(message);

        return valid;
    }
};

module.exports = Command;
