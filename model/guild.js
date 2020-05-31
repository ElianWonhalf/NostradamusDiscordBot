const EventEmitter = require('events');

const Config = require('../config.json');
const Logger = require('@elian-wonhalf/pretty-logger');
const Discord = require('discord.js');

const Guild = {
    events: new EventEmitter(),

    /** {Object} */
    levelRolesIds: {
        native: Config.roles.native,
        advanced: Config.roles.advanced,
        intermediate: Config.roles.intermediate,
        beginner: Config.roles.beginner,
    },

    /** {Object} */
    levelRoles: {
        native: 'Francophone Natif',
        advanced: 'Avancé',
        intermediate: 'Intermédiaire',
        beginner: 'Débutant',
    },

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
    serverLogChannel: null,

    /** {TextChannel} */
    memberFlowLogChannel: null,

    /** {TextChannel} */
    botChannel: null,

    /** {TextChannel} */
    automodChannel: null,

    /** {TextChannel} */
    beginnerChannel: null,

    /** {TextChannel} */
    rolesChannel: null,

    /** {TextChannel} */
    starboardChannel: null,

    /** {TextChannel} */
    announcementsChannel: null,

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
        Guild.serverLogChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.serverLog);
        Guild.memberFlowLogChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.memberFlowLog);
        Guild.botChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.bot);
        Guild.automodChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.automod);
        Guild.beginnerChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.beginner);
        Guild.rolesChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.roles);
        Guild.starboardChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.starboard);
        Guild.announcementsChannel = Guild.discordGuild.channels.cache.find(channel => channel.id === Config.channels.announcements);

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
     * @param message
     * @returns {Promise<GuildMember|null>}
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
     * @returns {boolean}
     */
    memberHasLevelRole: (member) => {
        return member !== undefined && member !== null && member.roles.some(role => Object.values(Guild.levelRolesIds).indexOf(role.id) > -1);
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
        return member !== undefined && member !== null && member.roles.cache.has(Config.roles.mod);
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
     * @returns {Discord.MessageEmbed}
     */
    messageToEmbed: async (message) => {
        const member = await Guild.getMemberFromMessage(message);
        const suffix = member !== null && member.nickname !== null ? ` aka ${member.nickname}` : '';

        return new Discord.MessageEmbed()
            .setAuthor(
                `${message.author.username}#${message.author.discriminator}${suffix}`,
                message.author.displayAvatarURL
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
        const memberList = Guild.discordGuild.members.cache.concat(bot.users.cache);

        if (message.mentions.members !== null && message.mentions.members.size > 0) {
            foundMembers = message.mentions.members.array();
        } else if (message.content.match(/[0-9]{18}/) !== null) {
            const ids = message.content.match(/[0-9]{18}/);

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
    }
};

module.exports = Guild;