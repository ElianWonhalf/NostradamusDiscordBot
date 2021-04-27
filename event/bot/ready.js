const Logger = require('@lilywonhalf/pretty-logger');
const Guild = require('../../model/guild');
const Language = require('../../model/language');
const Country = require('../../model/country');
const DM = require('../../model/dm');
const OnDemandVC = require('../../model/on-demand-vc');
const WatchedMember = require('../../model/watched-member');
const ActivityManager = require('../../model/activity-manager');
const LawlessFrench = require('../../model/lawlessfrench');
const VCTextVisibility = require('../../model/vc-text-visibility');

module.exports = async () => {
    Logger.info('Logged in as ' + bot.user.username + '#' + bot.user.discriminator);
    bot.user.setActivity('DM me to talk to mods').catch(Logger.exception);

    Logger.info('--------');

    Logger.info('Syncing guilds...');
    await Guild.init(bot);
    Logger.info('Guilds synced. Serving in ' + Guild.discordGuild.name);

    Logger.info('--------');

    Logger.info('Initialising languages...');
    await Language.init().catch(Logger.exception);
    Logger.info(`${Language.getRoleNameList().length} languages initialised.`);

    Logger.info('--------');

    Logger.info('Initialising countries...');
    await Country.init().catch(Logger.exception);
    Logger.info(`${Country.getRoleNameList().length} countries initialised.`);

    Logger.info('--------');

    Logger.info('Fixing VC text channels permissions...');
    VCTextVisibility.fixPermissionsAtBoot();

    Logger.info('--------');

    Logger.info('Initialising on-demand VCs...');
    await OnDemandVC.init().catch(Logger.exception);
    Logger.info(`${OnDemandVC.getOnDemandChannelsList().length} on-demand VCs initialised.`);

    Logger.info('--------');

    Logger.info('Initialising activities...');
    ActivityManager.init();
    Logger.info('Activities initialised.');

    Logger.info('--------');

    DM.init();
    WatchedMember.init();

    setInterval(LawlessFrench.intervalHandler, 2 * HOUR);
    LawlessFrench.intervalHandler();

    if (process.argv.includes('--reboot')) {
        Guild.botChannel.send('I\'m back :) .');
    }
};
