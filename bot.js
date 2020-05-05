const Logger = require('@elian-wonhalf/pretty-logger');
const Dotenv = require('dotenv');

Dotenv.config();

const mainProcess = (enableHue) => {
    const ChildProcess = require('child_process');

    process.on('uncaughtException', Logger.exception);

    Logger.info('Spawning bot subprocess...');
    const args = [process.argv[1], 'bot'];

    if (!enableHue) {
        args.push('--without-hue');
    }

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
                botProcess = ChildProcess.spawn(process.argv[0], [process.argv[1], 'bot', '--reboot']);
                bindProcess(botProcess);
            }
        });
    };

    bindProcess(botProcess);
    Logger.info('Bot subprocess spawned');
};

const botProcess = (enableHue) => {
    const Discord = require('discord.js');
    const CallerId = require('caller-id');

    global.enableHue = enableHue;
    global.testMode = process.env.NOSTRADAMUS_TEST === '1';
    global.bot = new Discord.Client({ fetchAllMembers: true });
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
                if (filename !== 'ready') {
                    bot.on(filename, require(`./event/bot/${filename}`));
                } else {
                    require(`./event/bot/${filename}`)();
                }
            });
    });

    Logger.info('--------');

    Logger.info('Logging in...');
    bot.login(Config.token);
};

const hueProcess = () => {
    const Discord = require('discord.js');

    global.bot = new Discord.Client({ fetchAllMembers: true });

    require('./model/translator');

    const Config = require('./config.json');

    bot.on('ready', () => {
        require('./model/hue.js').flash();
    });

    Logger.info('Logging in...');
    bot.login(Config.token);
};

let enableHue = process.argv[2] !== '--without-hue';

switch (process.argv[2]) {
    case 'bot':
        enableHue = process.argv[3] !== '--without-hue';
        botProcess(enableHue);
        break;

    case 'hue':
        hueProcess();
        break;

    default:
        enableHue = process.argv[2] !== '--without-hue';
        mainProcess(enableHue);
        break;
}
