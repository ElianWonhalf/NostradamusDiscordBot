const EventEmitter = require('events');

const Config = require('../config.json');
const Logger = require('@elian-wonhalf/pretty-logger');
const Language = require('./language');
const Country = require('./country');
const Discord = require('discord.js');

const SECONDS_IN_DAY = 24 * 60 * 60 * 1000;

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

    /** {TextChannel} */
    welcomeChannel: null,

    /** {TextChannel} */
    publicModLogChannel: null,

    /** {TextChannel} */
    anonymousMessagesChannel: null,

    /** {TextChannel} */
    modLogChannel: null,

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

    /**
     * @param {Client} bot
     */
    init: async (bot) => {
        Guild.discordGuild = bot.guilds.find(guild => guild.id === Config.guild);
        Guild.welcomeChannel = Guild.discordGuild.channels.find(channel => channel.id === Config.channels.welcome);
        Guild.publicModLogChannel = Guild.discordGuild.channels.find(channel => channel.id === Config.channels.publicModLog);
        Guild.anonymousMessagesChannel = Guild.discordGuild.channels.find(channel => channel.id === Config.channels.anonymousMessages);
        Guild.modLogChannel = Guild.discordGuild.channels.find(channel => channel.id === Config.channels.modLog);
        Guild.serverLogChannel = Guild.discordGuild.channels.find(channel => channel.id === Config.channels.serverLog);
        Guild.memberFlowLogChannel = Guild.discordGuild.channels.find(channel => channel.id === Config.channels.memberFlowLog);
        Guild.botChannel = Guild.discordGuild.channels.find(channel => channel.id === Config.channels.bot);
        Guild.automodChannel = Guild.discordGuild.channels.find(channel => channel.id === Config.channels.automod);
        Guild.beginnerChannel = Guild.discordGuild.channels.find(channel => channel.id === Config.channels.beginner);
        Guild.rolesChannel = Guild.discordGuild.channels.find(channel => channel.id === Config.channels.roles);

        Guild.kickInactiveNewMembers();
        setInterval(() => {
            Guild.kickInactiveNewMembers();
        }, 60 * 60);
    },

    kickInactiveNewMembers: () => {
        Guild.discordGuild.members.filter(member => {
            const threeDaysElapsed = ((Date.now() - member.joinedTimestamp) >= 3 * 24 * SECONDS_IN_DAY);
            const isOfficial = member.roles.has(Config.roles.officialMember);

            return !member.user.bot && threeDaysElapsed && !isOfficial;
        }).array().forEach(member => member.kick('[AUTO] Did not self assign roles'));
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
     * @returns {GuildMember|null}
     */
    getMemberFromMessage: async (message) => {
        let member = null;

        try {
            member = await Guild.discordGuild.fetchMember(message.author, false);
        } catch (exception) {
            Logger.error(exception.toString());
        }

        return member;
    },

    createRole: (name) => {
        return Guild.discordGuild.createRole({name: name, permissions: []});
    },

    /**
     * @param {GuildMember} member
     * @returns {boolean}
     */
    memberHasLevelRole: (member) => {
        return member.roles.some(role => Object.values(Guild.levelRolesIds).indexOf(role.id) > -1);
    },

    /**
     * @param {GuildMember} member
     * @returns {*}
     */
    isMemberNative: (member) => {
        return member.roles.has(Config.roles.native);
    },

    /**
     * @param {GuildMember} member
     * @returns {boolean}
     */
    memberHasLanguageRole: (member) => {
        return member.roles.some(role => {
            return Language.getRoleNameList().indexOf(role.name) > -1 || role.id === Config.roles.noLanguage;
        });
    },

    /**
     * @param {GuildMember} member
     * @returns {boolean}
     */
    memberHasCountryRole: (member) => {
        return member.roles.some(role => {
            return Country.getRoleNameList().indexOf(role.name) > -1 || role.id === Config.roles.noCountry;
        });
    },

    /**
     * @param {GuildMember} member
     */
    isMemberMod: (member) => {
        return member.roles.has(Config.roles.mod);
    },

    /**
     * @param {GuildMember} member
     */
    isMemberTutor: (member) => {
        return member.roles.has(Config.roles.tutor);
    },

    /**
     * @param {string} roleName
     * @returns {Role|null}
     */
    getRoleByName: (roleName) => {
        return roleName === undefined || roleName === null ? null : Guild.discordGuild.roles.find(
            role => role.name.toLowerCase() === roleName.toLowerCase()
        );
    },

    /**
     * @param {Message} message
     * @returns {Discord.RichEmbed}
     */
    messageToEmbed: async (message) => {
        const member = await Guild.getMemberFromMessage(message);
        const suffix = member !== null && member.nickname !== null ? ` aka ${member.nickname}` : '';

        return new Discord.RichEmbed()
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

        if (message.mentions.members.array().length > 0) {
            foundMembers = message.mentions.members.array();
        } else if (message.content.match(/[0-9]{18}/) !== null) {
            const ids = message.content.match(/[0-9]{18}/);

            ids.map(id => {
                if (message.guild.members.has(id)) {
                    foundMembers.push(message.guild.members.get(id));
                }
            });
        } else {
            const memberList = message.guild.members.array();

            certain = false;
            memberList.forEach(member => {
                const nickname = member.nickname !== null ? `${member.nickname.toLowerCase()}#${member.user.discriminator}` : '';
                const username = `${member.user.username.toLowerCase()}#${member.user.discriminator}`;
                const content = message.cleanContent.toLowerCase().split(' ').splice(1).join(' ');

                const contentInNickname = nickname !== '' ? nickname.indexOf(content) > -1 : false;
                const contentInUsername = username.indexOf(content) > -1;
                const nicknameInContent = nickname !== '' ? content.indexOf(nickname) > -1 : false;
                const usernameInContent = content.indexOf(username) > -1;

                if (contentInNickname || contentInUsername || nicknameInContent || usernameInContent) {
                    foundMembers.push(member);
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