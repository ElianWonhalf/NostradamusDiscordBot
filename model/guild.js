const EventEmitter = require('events');

const Config = require('../config.json');
const Logger = require('@lilywonhalf/pretty-logger');
const { MessageEmbed, Collection } = require('discord.js');

const Guild = {
    /** {EventEmitter} */
    events: new EventEmitter(),

    /** {Collection<String>} */
    levelRoles: new Collection(),

    /** {Collection<Collection>} */
    channelMessages: new Collection(),

    /** {Guild} */
    discordGuild: null,

    /** {Object} */
    voiceMoveMembers: {},

    /** {Object} */
    reactionCollectors: {},

    /** {TextChannel} */
    welcomeChannel: null,

    /** {TextChannel} */
    publicModLogChannel: null,

    /** {TextChannel} */
    anonymousMessagesChannel: null,

    /** {TextChannel} */
    modLogChannel: null,

    /** {TextChannel} */
    modDMsChannel: null,

    /** {TextChannel} */
    modAnnouncementsChannel: null,

    /** {TextChannel} */
    serverLogChannel: null,

    /** {TextChannel} */
    memberFlowLogChannel: null,

    /** {TextChannel} */
    memberModificationLogChannel: null,

    /** {TextChannel} */
    botChannel: null,

    /** {TextChannel} */
    watchlistChannel: null,

    /** {TextChannel} */
    automodChannel: null,

    /** {TextChannel} */
    beginnerChannel: null,

    /** {TextChannel} */
    learntLanguageChannel: null,

    /** {TextChannel} */
    otherLanguageChannel: null,

    /** {TextChannel} */
    classroom1Channel: null,

    /** {TextChannel} */
    classroom2Channel: null,

    /** {TextChannel} */
    classroom3Channel: null,

    /** {TextChannel} */
    explicitClassroomChannel: null,

    /** {TextChannel} */
    rolesChannel: null,

    /** {TextChannel} */
    starboardChannel: null,

    /** {TextChannel} */
    announcementsChannel: null,

    /** {TextChannel} */
    metaChannel: null,

    /** {TextChannel} */
    softChannel: null,

    /** {TextChannel} */
    correspondenceInformationChannel: null,

    /** {TextChannel} */
    correspondenceLearnersChannel: null,

    /** {TextChannel} */
    correspondenceNativesChannel: null,

    /** {CategoryChannel} */
    smallVoiceCategoryChannel: null,

    /** {VoiceChannel} */
    smallVoiceChatRequestChannel: null,

    /**
     * @param {Client} bot
     */
    init: async (bot) => {
        Guild.discordGuild = bot.guilds.cache.find(guild => guild.id === Config.guild);
        Guild.welcomeChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.welcome);
        Guild.publicModLogChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.publicModLog);
        Guild.anonymousMessagesChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.anonymousMessages);
        Guild.modLogChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.modLog);
        Guild.modDMsChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.modDMs);
        Guild.modAnnouncementsChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.modAnnouncements);
        Guild.serverLogChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.serverLog);
        Guild.memberFlowLogChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.memberFlowLog);
        Guild.memberModificationLogChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.memberModificationLog);
        Guild.botChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.bot);
        Guild.watchlistChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.watchlist);
        Guild.automodChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.automod);
        Guild.beginnerChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.beginner);
        Guild.learntLanguageChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.learntLanguage);
        Guild.otherLanguageChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.otherLanguage);
        Guild.classroom1Channel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.classroom1);
        Guild.classroom2Channel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.classroom2);
        Guild.classroom3Channel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.classroom3);
        Guild.explicitClassroomChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.explicitClassroom);
        Guild.rolesChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.roles);
        Guild.starboardChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.starboard);
        Guild.announcementsChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.announcements);
        Guild.metaChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.meta);
        Guild.softChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.soft);
        Guild.correspondenceInformationChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.correspondenceInformation);
        Guild.correspondenceLearnersChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.correspondenceLearners);
        Guild.correspondenceNativesChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.correspondenceNatives);
        Guild.smallVoiceCategoryChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channelCategories.smallGroupVocal);
        Guild.smallVoiceChatRequestChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.smallVoiceChatRequest);

        Guild.levelRoles.set(Config.roles.native, 'Francophone Natif');
        Guild.levelRoles.set(Config.roles.advanced, 'Avancé');
        Guild.levelRoles.set(Config.roles.intermediate, 'Intermédiaire');
        Guild.levelRoles.set(Config.roles.beginner, 'Débutant');
        Guild.levelRoles.set(Config.roles.bornFrancophone, 'Francophone de naissance');

        Guild.kickInactiveNewMembers();
        setInterval(() => {
            Guild.kickInactiveNewMembers();
        }, 60 * 60 * 1000);
    },

    kickInactiveNewMembers: async () => {
        if (await Guild.discordGuild.members.prune({days: 7, dry: true, count: true, reason: ''}) > 0) {
            Guild.discordGuild.members.prune({days: 7, dry: false, count: false, reason: 'Purging members 😈'});
        }
    },

    /**
     * @param {Snowflake} snowflake
     * @param {ReactionCollector} collector
     */
    addMemberReactionCollector: (snowflake, collector) => {
        if (!Guild.reactionCollectors.hasOwnProperty(snowflake)) {
            Guild.reactionCollectors[snowflake] = [];
        }

        Guild.reactionCollectors[snowflake].push(collector);
    },

    /**
     * @param {Snowflake} snowflake
     */
    stopMemberReactionCollectors: (snowflake) => {
        if (Guild.reactionCollectors.hasOwnProperty(snowflake)) {
            Guild.reactionCollectors[snowflake].forEach(collector => collector.stop());
            delete Guild.reactionCollectors[snowflake];
        }
    },

    /**
     * @param {Snowflake} snowflake
     * @param {int} interval
     */
    addMemberToVoiceStateUpdateWatcher: (snowflake, interval) => {
        Guild.voiceMoveMembers[snowflake] = interval;
    },

    /**
     * @param {Snowflake} snowflake
     */
    removeMemberFromVoiceStateUpdateWatcher: (snowflake) => {
        delete Guild.voiceMoveMembers[snowflake];
    },

    /**
     * @param {GuildMember} member
     */
    announcePatreonBooster: (member) => {
        Guild.metaChannel.send(trans('model.guild.patreonBoosterAnnouncement', [member.toString()]));
    },

    /**
     * @param message
     * @returns {Promise.<GuildMember|null>}
     */
    getMemberFromMessage: async (message) => {
        return await Guild.discordGuild.members.fetch(message.author).catch(exception => {
            Logger.error(exception.toString());

            return null;
        });
    },

    createRole: (name) => {
        return Guild.discordGuild.roles.create({data: {name: name, permissions: []}});
    },

    /**
     * @param {GuildMember} member
     * @param {Snowflake} snowflake - The Role snowflake.
     * @returns {boolean}
     */
    memberHasRole: (member, snowflake) => {
        return member !== undefined && member !== null && member.roles.cache.some(role => role.id === snowflake);
    },

    /**
     * @param {GuildMember} member
     * @returns {*}
     */
    isMemberNative: (member) => {
        return member !== undefined && member !== null && member.roles.cache.has(Config.roles.native);
    },

    /**
     * @param {GuildMember} member
     */
    isMemberMod: (member) => {
        return member !== undefined && member !== null
            && (member.roles.cache.has(Config.roles.mod) || member.id === Config.admin);
    },

    /**
     * @param {GuildMember} member
     */
    isMemberSoft: (member) => {
        return member !== undefined && member !== null && member.roles.cache.has(Config.roles.soft);
    },

    /**
     * @param {GuildMember} member
     */
    isMemberTutor: (member) => {
        return member !== undefined && member !== null && member.roles.cache.has(Config.roles.tutor);
    },

    /**
     * @param {string} roleName
     * @returns {Role|null}
     */
    getRoleByName: (roleName) => {
        return roleName === undefined || roleName === null ? null : Guild.discordGuild.roles.cache.find(
            role => role.name.toLowerCase() === roleName.toLowerCase()
        );
    },

    /**
     * @param {Message} message
     * @returns {MessageEmbed}
     */
    messageToEmbed: async (message) => {
        const member = await Guild.getMemberFromMessage(message);
        const suffix = member !== null && member.nickname !== null && member.nickname !== undefined ? ` aka ${member.nickname}` : '';

        return new MessageEmbed()
            .setAuthor(
                `${message.author.username}#${message.author.discriminator}${suffix}`,
                message.author.displayAvatarURL({ dynamic: true })
            )
            .setColor(0x00FF00)
            .setDescription(message.content);
    },

    /**
     * @param {Message} message
     * @returns {{certain: boolean, foundMembers: Array}}
     */
    findDesignatedMemberInMessage: (message) => {
        let foundMembers = [];
        let certain = true;
        const memberList = bot.users.cache.concat(Guild.discordGuild.members.cache);

        if (message.content.match(/[0-9]{16,18}/u) !== null) {
            const ids = message.content.match(/[0-9]{16,18}/gu);

            ids.map(id => {
                if (memberList.has(id)) {
                    foundMembers.push(memberList.get(id));
                }
            });
        } else {
            certain = false;
            memberList.forEach(member => {
                const user = member.user === undefined ? member : member.user;

                const hasNickname = member.nickname !== undefined && member.nickname !== null;
                const nickname = hasNickname ? `${member.nickname.toLowerCase()}#${user.discriminator}` : '';
                const username = `${user.username.toLowerCase()}#${user.discriminator}`;
                const content = message.cleanContent.toLowerCase().split(' ').splice(1).join(' ');

                if (content.length > 0) {
                    const contentInNickname = hasNickname ? nickname.indexOf(content) > -1 : false;
                    const contentInUsername = username.indexOf(content) > -1;
                    const nicknameInContent = hasNickname ? content.indexOf(nickname) > -1 : false;
                    const usernameInContent = content.indexOf(username) > -1;

                    if (contentInNickname || contentInUsername || nicknameInContent || usernameInContent) {
                        foundMembers.push(member);
                    }
                }
            });
        }

        return {
            certain,
            foundMembers
        };
    },

    rolePingHandler: async (message) => {
        const roleMentions = message.mentions.roles.keyArray();

        if (roleMentions.includes(Config.roles.everyone)) {
            Guild.everyonePingHandler(message);
        }

        if (roleMentions.includes(Config.roles.mod) && !Config.channelCategories.mod.includes(message.channel.parent.id)) {
            Guild.softChannel.send(
                `<@&${Config.roles.soft}> ${message.channel.toString()} ${message.url}`,
                {
                    embed: await Guild.messageToEmbed(message)
                }
            );
        }
    },

    everyonePingHandler: (message) => {
        if (message.guild !== null && message.cleanContent.includes('@everyone')) { // Could be @here
            message.member.roles.add([Config.roles.everyone]);
        }
    },

    /**
     * @param {TextChannel} channel
     * @param {boolean} rebuildCache
     * @returns {Promise<Collection>}
     */
    fetchAllChannelMessages: async (channel, rebuildCache) => {
        rebuildCache = rebuildCache || false;

        if (rebuildCache || !Guild.channelMessages.has(channel.id)) {
            Logger.info(`Fetching all channel messages for #${channel.name}`);
            Guild.channelMessages.set(channel.id, new Collection());

            const options = { limit: 100 };
            let messages;

            do {
                messages = await channel.messages.fetch(options).catch(Logger.exception);

                if (messages !== undefined && messages.size > 0) {
                    options.before = messages.last().id;

                    Logger.info(`#${channel.name}: found ${messages.size} messages, the latest's date being ${messages.first().createdAt.toLocaleString()}`);
                    Guild.channelMessages.set(
                        channel.id,
                        Guild.channelMessages.get(channel.id).concat(messages)
                    );
                }
            } while (messages === undefined || messages.size > 0);
        }

        Guild.channelMessages.set(
            channel.id,
            Guild.channelMessages.get(channel.id).concat(channel.messages.cache)
        );

        return Guild.channelMessages.get(channel.id);
    }
};

module.exports = Guild;
