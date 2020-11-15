const Logger = require('@lilywonhalf/pretty-logger');
const Config = require('../../../config.json');
const Trello = require('../../trello');
const Guild = require('../../guild');

module.exports = async (message, args, list, ping) => {
    ping = ping || false;

    if (args.length > 0) {
        let title = '';
        const attachments = [...message.attachments.values()].map(attachment => attachment.url);

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];

            if (/^https?:\/\//u.test(arg)) {
                attachments.push(arg);
            } else {
                title += ` ${arg}`;
            }
        }

        const data = {
            name: title.trim(),
            idList: list,
            pos: 'top'
        };

        const card = await Trello.call('cards', data, 'POST').catch(Logger.exception);

        if (card && card.id) {
            await Promise.all(
                attachments.map(attachment => {
                    return Trello.call(
                        `cards/${card.id}/attachments`,
                        {url: attachment},
                        'POST'
                    ).catch(Logger.exception);
                })
            );

            const emoji = bot.emojis.cache.find(emoji => emoji.name === 'pollyes');
            await message.react(emoji);

            if (ping) {
                Guild.modAnnouncementsChannel.send(trans(
                    'model.command.trello.addCard.ping',
                    [Guild.discordGuild.roles.cache.get(Config.roles.mod).toString(), card.url],
                    'en'
                ))
            }
        } else {
            const emoji = bot.emojis.cache.find(emoji => emoji.name === 'pollno');
            await message.react(emoji);
            Logger.exception(card);
        }
    } else {
        const emoji = bot.emojis.cache.find(emoji => emoji.name === 'pollno');
        await message.react(emoji);
        await message.reply(trans('model.command.trello.addCard.ping', [], 'en'));
    }
};
