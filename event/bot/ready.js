const Logger = require('@elian-wonhalf/pretty-logger');
const Guild = require('../../model/guild');
const Language = require('../../model/language');
const Country = require('../../model/country');
const DM = require('../../model/dm');
const WatchedMember = require('../../model/watched-member');

module.exports = async () => {
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
    WatchedMember.init();

    if (process.argv[3] === '--reboot') {
        Guild.botChannel.send('I\'m back :) .');
    }
};
