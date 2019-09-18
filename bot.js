const Logger = require('@elian-wonhalf/pretty-logger');
const Dotenv = require('dotenv');

Dotenv.config();

const mainProcess = () => {
    const ChildProcess = require('child_process');

    process.on('uncaughtException', Logger.exception);

    Logger.info('Spawning bot subprocess...');
    let botProcess = ChildProcess.spawn(process.argv[0], [process.argv[1], 'bot']);

    const stdLog = (callback) => {
        return (data) => {
            const reboot = data.toString().toLowerCase().indexOf('reboot') > -1
                || data.toString().toLowerCase().indexOf('econnreset') > -1
                || data.toString().toLowerCase().indexOf('etimedout') > -1;

            data = data.toString().replace(/\n$/, '').split('\n');
            data.map(datum => callback('|-- ' + datum));

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

            botProcess = ChildProcess.spawn(process.argv[0], [process.argv[1], 'bot', '--reboot']);
            bindProcess(botProcess);
        });
    };

    bindProcess(botProcess);
    Logger.info('Bot subprocess spawned');
};

const botProcess = () => {
    const Discord = require('discord.js');
    const CallerId = require('caller-id');

    global.testMode = process.env.NOSTRADAMUS_TEST === '1';
    global.bot = new Discord.Client();
    global.debug = (message) => {
        if (process.env.NOSTRADAMUS_DEBUG === '1') {
            const caller = CallerId.getData();
            const path = caller.filePath.substr(
                caller.filePath.toLowerCase().indexOf('/nostradamus/') + 13
            ).substr(
                caller.filePath.toLowerCase().indexOf('/shakespeare/') + 13
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
    const Guild = require('./model/guild');
    const Language = require('./model/language');
    const Country = require('./model/country');
    const Command = require('./model/command');
    const SemiBlacklist = require('./model/semi-blacklist');
    const ModerationLog = require('./model/moderation-log');
    const DM = require('./model/dm');
    const MemberRolesFlow = require('./model/member-roles-flow');

    const crashRecover = (exception) => {
        Logger.exception(exception);
        Logger.notice('Need reboot');
    };

    process.on('uncaughtException', crashRecover);
    bot.on('error', crashRecover);

    /**
     * @param {GuildMember} member
     */
    bot.on('guildMemberAdd', (member) => {
        if (!testMode && member.user.id !== Config.testAccount || testMode && member.user.id === Config.testAccount) {
            Guild.welcomeChannel.send(
                trans(
                    'bot.welcomeMessage',
                    [
                        member.user,
                        Guild.discordGuild.name,
                        `%${Config.learntLanguage}%`
                    ]
                )
            );
        }
    });

    /**
     * @param {GuildMember} member
     */
    bot.on('guildMemberRemove', async (member) => {
        if (!testMode && member.user.id !== Config.testAccount || testMode && member.user.id === Config.testAccount) {
            Guild.clearWelcomeMessagesForMember(member);
            ModerationLog.processMemberRemove(member);
        }
    });

    Command.init();

    /**
     * @param {Message} message
     */
    bot.on('message', async (message) => {
        const user = message.author;

        if (message.channel.id === Config.channels.roles) {
            setTimeout(() => {
                message.delete().catch(exception => Logger.error(exception.toString()));
            }, 60000);
        }

        if (!testMode && user.id !== Config.testAccount || testMode && (user.id === Config.testAccount || user.bot)) {
            SemiBlacklist.parseMessage(message);

            if (message.channel.id === Config.channels.welcome) {
                const member = await Guild.discordGuild.fetchMember(user, false);

                Guild.addMessageFromWelcomeToMap(message);
                if (!user.bot && !member.roles.has(Config.roles.officialMember)) {
                    MemberRolesFlow.parse(message);
                }
            } else if (!user.bot) {
                const isCommand = Command.parseMessage(message);
                DM.parseMessage(message, isCommand);
            }
        }
    });

    bot.on('voiceStateUpdate', Guild.voiceStateUpdateHandler);

    bot.on('ready', async () => {
        Logger.info('Logged in as ' + bot.user.username + '#' + bot.user.discriminator);

        Logger.info('--------');

        Logger.info('Syncing guilds...');
        bot.syncGuilds();
        await Guild.init(bot);
        Logger.info('Guilds synced. Serving in ' + Guild.discordGuild.name);

        Logger.info('--------');

        Logger.info('Initialising languages...');
        try {
            await Language.init();
        } catch (error) {
            Logger.exception(error);
        }
        Logger.info(`${Language.getRoleNameList().length} languages initialised.`);

        Logger.info('--------');

        Logger.info('Initialising countries...');
        try {
            await Country.init();
        } catch (error) {
            Logger.exception(error);
        }
        Logger.info(`${Country.getRoleNameList().length} countries initialised.`);

        Logger.info('--------');

        DM.init();

        if (process.argv[3] === '--reboot') {
            Guild.botChannel.send('I\'m back :) .');
        }
    });

    Logger.info('--------');

    Logger.info('Logging in...');
    bot.login(Config.token);
};

process.argv[2] === 'bot' ? botProcess() : mainProcess();
