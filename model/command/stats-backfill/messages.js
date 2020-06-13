const Logger = require('@lilywonhalf/pretty-logger');
const fs = require('fs');
const Discord = require('discord.js');
const StatMessages = require('../../stat-messages');
const Guild = require('../../guild');

/**
 * @param {Array} archivedChannels
 * @param {Array} archiving
 * @param {Array} channelsToArchive
 * @param {object} archives
 */
const saveProgress = (archivedChannels, archiving, channelsToArchive, archives) => {
    fs.writeFileSync('./cache/stats-backfill/messages.json', JSON.stringify({
        archivedChannels,
        archiving,
        channelsToArchive,
        archives
    }, null, 4));
};

/**
 * @returns {object|null}
 */
const getProgress = () => {
    let data = null;

    if (fs.existsSync('./cache/stats-backfill/messages.json')) {
        data = require('../../../cache/stats-backfill/messages.json');
    }

    return data;
};

/**
 * @param {Message} message
 */
module.exports = async (message) => {
    message.channel.send(trans('model.command.statsBackfill.messages.warning', [], 'en'));

    Logger.info('Starting messages stats backfilling. Retrieving channel list...');
    let archivedChannels = [];
    let archiving = [];
    let channelsToArchive = [];
    let archives = {};
    const excludedCategories = ['645854543313371155'];

    let channels;
    let gatheredAmount = 0;
    let valuesAmount = 0;
    let statusMessage = null;

    const progress = getProgress();

    if (progress === null) {
        channels = Guild.discordGuild.channels.cache.filter(channel => {
            return channel.type === 'text' && !excludedCategories.includes(channel.parentID);
        });

        channels.forEach(channel => {
            channelsToArchive.push(channel.id);
        });
    } else {
        Logger.info(`Retrieving save file...`);
        channels = new Discord.Collection();

        if (archiving.length > 0) {
            channels.set(progress.archiving[0], Guild.discordGuild.channels.cache.get(archiving[0]));
        }

        progress.channelsToArchive.forEach(channelID => {
            channels.set(channelID, Guild.discordGuild.channels.cache.get(channelID));
        });

        archives = progress.archives;
        archivedChannels = progress.archivedChannels;
        channelsToArchive = progress.channelsToArchive;

        Object.values(archives).forEach(messagesByAuthor => {
            gatheredAmount += Object.values(messagesByAuthor).reduce((carry, count) => carry + count);
            valuesAmount += Object.values(messagesByAuthor).length;
        });
    }

    Logger.info(`Channel list retrieved: ${channels.size} channels. Truncating table...`);
    StatMessages.truncate();
    Logger.info(`Table truncated, starting data gathering...`);

    for (let [, channel] of channels) {
        const options = { limit: 100 };
        let messages;
        let gatheredInChannel = 0;

        if (progress !== null && progress.archiving[0] === channel.id) {
            options.before = progress.archiving[1];
        }

        Logger.info(`Gathering data; Entering channel ${channel.name}...`);
        const status = trans('model.command.statsBackfill.messages.gatheringStatus', [gatheredAmount, channel.name], 'en');

        if (statusMessage === null) {
            statusMessage = await message.channel.send(status);
        } else {
            statusMessage = await statusMessage.edit(status).catch(Logger.exception);
        }

        do {
            messages = await channel.messages.fetch(options).catch(Logger.exception);

            if (messages !== undefined && messages.size > 0) {
                options.before = messages.last().id;

                const parsableMessages = messages.filter(message => !message.author.bot);
                Logger.info(`#${channel.name}: found ${parsableMessages.size} messages, the latest's date being ${messages.first().createdAt.toLocaleString()}, ${gatheredAmount} gathered so far`);

                for (let [, message] of parsableMessages) {
                    archiving = [channel.id, message.id];

                    if (gatheredInChannel % 100000 === 0) {
                        saveProgress(archivedChannels, archiving, channelsToArchive, archives);
                    }

                    const messageDate = new Date(message.createdTimestamp);

                    // Get the day
                    messageDate.setHours(0);
                    messageDate.setMinutes(0);
                    messageDate.setSeconds(0);
                    messageDate.setMilliseconds(0);

                    if (!archives.hasOwnProperty(message.author.id)) {
                        archives[message.author.id] = {};
                    }

                    if (!archives[message.author.id].hasOwnProperty(messageDate.getTime())) {

                        archives[message.author.id][messageDate.getTime()] = 0;
                        valuesAmount++;
                    }

                    archives[message.author.id][messageDate.getTime()]++;
                    gatheredAmount++;
                    gatheredInChannel++;
                }
            }
        } while (messages === undefined || messages.size > 0);

        channelsToArchive.splice(channelsToArchive.findIndex(channelID => channelID === archiving[0]), 1);
        archivedChannels.push(archiving[0]);
        archiving = [];
        saveProgress(archivedChannels, archiving, channelsToArchive, archives);
        Logger.info(`Data for channel ${channel.name} gathered`);
    }

    saveProgress(archivedChannels, archiving, channelsToArchive, archives);
    Logger.info(`Done gathering data, transforming information for database...`);
    const lines = [];

    for (let snowflake of Object.keys(archives)) {
        for (let timestamp of Object.keys(archives[snowflake])) {
            lines.push([
                snowflake,
                `+${archives[snowflake][timestamp]}`,
                { date: new Date(parseInt(timestamp)) }
            ]);
        }
    }

    Logger.info(`Done transforming information, saving in database...`);

    const savingMessage = trans('model.command.statsBackfill.messages.savingStatus', [gatheredAmount], 'en');

    if (statusMessage === null) {
        await message.channel.send(savingMessage).catch(Logger.exception);
    } else {
        await statusMessage.edit(savingMessage).catch(Logger.exception);
    }

    await StatMessages.bulkSave(lines);

    Logger.info(`Done backfilling stats!`);
    message.channel.send(trans('model.command.statsBackfill.messages.done', [], 'en'));
};
