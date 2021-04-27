const Logger = require('@lilywonhalf/pretty-logger');
const Config = require('../../config.json');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class TrombinoscopePurge
{
    static instance = null;
    static running = false;

    constructor() {
        if (TrombinoscopePurge.instance !== null) {
            return TrombinoscopePurge.instance;
        }

        this.aliases = ['trombi-purge', 'trombipurge', 'trompurge'];
        this.category = CommandCategory.MODERATION;
        this.isAllowedForContext = CommandPermission.isMemberMod;

    }

    /**
     * @param {Message} message
     * @param {Array} args
     */
    async process(message, args) {
        if (!TrombinoscopePurge.running) {
            TrombinoscopePurge.running = true;
            await message.react(bot.emojis.cache.find(emoji => emoji.name === 'alogo'));
            await message.react(bot.emojis.cache.find(emoji => emoji.name === 'ThirstyKitteh'));

            const dryRun = args.some(arg => arg.toLowerCase() === '-d' || arg.toLowerCase() === '--dry-run');
            const messagesToDelete = [];
            const foundMembers = Guild.findDesignatedMemberInMessage(message).foundMembers.filter(member => member.user);

            if (foundMembers.length < 1) {
                return message.react('❌');
            }

            const channel = Guild.trombinoscopeChannel;
            const options = { limit: 100 };
            let messages;
            let gatheredAmount = 0;

            Logger.info(`Gathering data; Entering channel ${channel.name}...`);

            do {
                messages = await channel.messages.fetch(options).catch(Logger.exception);

                if (messages !== undefined && messages.size > 0) {
                    options.before = messages.last().id;

                    const parsableMessages = messages.filter(message => {
                        const isBot = message.author.bot;
                        const hasAttachment = message.attachments.some(attachment => attachment.height !== null);
                        const hasLink = /https?:\/\/.+/igu.test(message.content);

                        return !isBot && (hasAttachment || hasLink);
                    });
                    Logger.info(`#${channel.name}: found ${parsableMessages.size} messages, the latest's date being ${messages.first().createdAt.toLocaleString()}, ${gatheredAmount} gathered so far`);

                    for (let [, message] of parsableMessages) {
                        const shouldDelete = foundMembers.some(member => {
                            const sameAuthor = member.id === message.author.id;
                            const pingedInMessage = message.mentions.users.array().some(user => user.id === member.id);

                            return sameAuthor || pingedInMessage;
                        });

                        if (shouldDelete) {
                            messagesToDelete.push(message);
                        }

                        gatheredAmount++;
                    }
                }
            } while (messages === undefined || messages.size > 0);

            await message.channel.send(trans(
                'model.command.trombinoscopePurge.beforeDelete',
                [messagesToDelete.length],
                'en'
            ));

            if (!dryRun) {
                await channel.bulkDelete(messagesToDelete).catch(error => Logger.warning(error.message));
                const messagesLeftToDelete = messagesToDelete.filter(message => !message.deleted);

                const midDeleteMessage = await message.channel.send(trans(
                    'model.command.trombinoscopePurge.midDelete',
                    [messagesLeftToDelete.length],
                    'en'
                ));

                for (let i = 0; i < messagesLeftToDelete.length; i++) {
                    await messagesLeftToDelete[i].delete();

                    if ((messagesLeftToDelete.length - i - 1) % 5 === 0) {
                        await midDeleteMessage.edit(trans(
                            'model.command.trombinoscopePurge.midDelete',
                            [messagesLeftToDelete.length - i - 1],
                            'en'
                        ));
                    }
                }
            }

            await message.channel.send(trans(
                'model.command.trombinoscopePurge.afterDelete',
                [messagesToDelete.length],
                'en'
            ));

            await message.channel.send('--');

            await message.channel.send(trans(
                'model.command.trombinoscopePurge.beforeRoleRemove',
                [foundMembers.length],
                'en'
            ));

            if (!dryRun) {
                await Promise.all(foundMembers.map(async member => member.roles.remove(Config.roles.trombinoscope)));
            }

            await message.channel.send(trans(
                'model.command.trombinoscopePurge.afterRoleRemove',
                [foundMembers.length],
                'en'
            ));

            await message.channel.send('--');

            await message.channel.send(trans(
                'model.command.trombinoscopePurge.beforeDM',
                [foundMembers.length],
                'en'
            ));

            if (!dryRun) {
                await Promise.all(foundMembers.map(async member => {
                    return member.send(trans('model.command.trombinoscopePurge.dm')).catch(
                        error => Logger.warning(error.message)
                    )
                }));
            }

            await message.channel.send(trans(
                'model.command.trombinoscopePurge.afterDM',
                [foundMembers.length],
                'en'
            ));

            if (!dryRun) {
                channel.send(trans(
                    'model.command.trombinoscopePurge.publicNotification',
                    [foundMembers.join(', ')]
                ));
            }

            await message.channel.send(trans(
                'model.command.trombinoscopePurge.done',
                [foundMembers.length],
                'en'
            ));

            await message.reactions.removeAll();
            await message.react(bot.emojis.cache.find(emoji => emoji.name === 'pollyes'));
            TrombinoscopePurge.running = false;
        } else {
            return message.react('⌛');
        }
    }
}

module.exports = new TrombinoscopePurge();
