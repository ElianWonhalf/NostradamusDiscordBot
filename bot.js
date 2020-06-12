const Logger = require('@elian-wonhalf/pretty-logger');
const Dotenv = require('dotenv');

// I know that the following can bring a lot of anger.
// I know there would be a bajillion reasons why I shouldn't do this.
// But you know what?
// Fuck it :) .
Array.prototype.getRandomElement = function () {
    return this[Math.floor(Math.random() * this.length)];
};

global.secondsAmountToDelayString = (seconds) => {
    seconds = parseInt(seconds);

    const parts = {
        'jour': Math.floor(seconds / (3600 * 24)),
        'heure': Math.floor(seconds % (3600 * 24) / 3600),
        'minute': Math.floor(seconds % 3600 / 60),
        'seconde': Math.floor(seconds % 60)
    };

    return Object.keys(parts).reduce((carry, part) => {
        if (parts[part] > 0) {
            carry += `${parts[part]} ${part}`;

            if (parts[part] > 1) {
                carry += 's';
            }

            carry += ', ';
        }

        return carry;
    }, '').replace(/, $/, '');
};

Dotenv.config();

const mainProcess = () => {
    const ChildProcess = require('child_process');

    process.on('uncaughtException', Logger.exception);

    Logger.info('Spawning bot subprocess...');
    const args = [process.argv[1], 'bot'];
    let botProcess = ChildProcess.spawn(process.argv[0], args);

    const stdLog = (callback) => {
        return (data) => {
            const wantToDie = data.toString().toLowerCase().indexOf('killnostrapls') > -1;
            const reboot = data.toString().toLowerCase().indexOf('reboot') > -1
                || data.toString().toLowerCase().indexOf('econnreset') > -1
                || data.toString().toLowerCase().indexOf('etimedout') > -1;

            data = data.toString().replace(/\n$/, '').split('\n');
            data.map(datum => callback('|-- ' + datum));

            if (wantToDie) {
                Logger.info('Asked to kill');
                botProcess.kill('SIGHUP');
                process.exit(0);
            }

            if (reboot) {
                botProcess.kill();
            }
        };
    };

    const bindProcess = (subprocess) => {
        subprocess.stdout.on('data', stdLog(console.log));
        subprocess.stderr.on('data', stdLog(console.error));
        subprocess.on('close', (code) => {
            Logger.error(`Bot subprocess exited with code ${code}`);

            if (code !== 0) {
                botProcess = ChildProcess.spawn(
                    process.argv[0],
                    args.concat(['--reboot'])
                );
                bindProcess(botProcess);
            }
        });
    };

    bindProcess(botProcess);
    Logger.info('Bot subprocess spawned');
};

const botProcess = () => {
    const Discord = require('discord.js');
    const CallerId = require('caller-id');

    global.bot = new Discord.Client({ fetchAllMembers: true });
    global.isRightGuild = (guildSnowflake) => guildSnowflake === Config.guild;
    global.debug = (message) => {
        if (process.env.NOSTRADAMUS_DEBUG === '1') {
            const caller = CallerId.getData();
            const path = caller.filePath.substr(
                caller.filePath.toLowerCase().indexOf('/nostradamus/') + 7
            ).substr(
                caller.filePath.toLowerCase().indexOf('/shakespeare/') + 7
            );
            const prefix = `${path}:${caller.lineNumber}`;

            if (typeof message === 'string') {
                Logger.info(`${prefix} | ${message}`);
            } else {
                Logger.info(prefix);
                Logger.debug(message);
            }
        }
    };
    global.saveDebugFile = (filename, data) => {
        if (!fs.existsSync('./debug')) {
            fs.mkdirSync('./debug');
        }

        fs.writeFileSync(`./debug/${filename}`, data);
    };

    require('./model/translator');

    const Config = require('./config.json');
    const Command = require('./model/command');
    const fs = require('fs');

    const crashRecover = (exception) => {
        Logger.exception(exception);
        Logger.notice('Need reboot');
    };

    process.on('uncaughtException', crashRecover);
    bot.on('error', crashRecover);

    Command.init();

    bot.on('ready', () => {
        fs.readdirSync('./event/bot/')
            .filter(filename => filename.endsWith('.js'))
            .map(filename => filename.substr(0, filename.length - 3))
            .forEach(filename => {
                const event = filename.replace(/_([A-Z])/gu, character => `${character.toUpperCase()}`);

                if (filename !== 'ready') {
                    bot.on(event, require(`./event/bot/${filename}`));
                } else {
                    require(`./event/bot/${filename}`)();
                }
            });

        const minute = require('./event/system/minute');

        setInterval(minute, 60 * 1000);
        minute();
    });

    Logger.info('--------');

    Logger.info('Logging in...');
    bot.login(Config.token);
};

switch (process.argv[2]) {
    case 'bot':
        botProcess();
        break;

    default:
        mainProcess();
        break;
}
