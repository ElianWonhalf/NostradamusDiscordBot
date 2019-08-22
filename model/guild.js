const Config = require('../config.json');
const Logger = require('@elian-wonhalf/pretty-logger');
const Language = require('./language');
const Country = require('./country');
const Discord = require('discord.js');

const SECONDS_IN_DAY = 24 * 60 * 60 * 1000;

const Guild = {
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

    /** {Discord.Collection} */
    memberMessageMap: new Discord.Collection(),

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
    botChannel: null,

    /** {TextChannel} */
    automodChannel: null,

    /**
     * @param {Client} bot
     */
    init: async (bot) => {
        Guild.discordGuild = bot.guilds.find(guild => guild.id === Config.guild);
        Guild.welcomeChannel = Guild.discordGuild.channels.find(channel => channel.id === Config.channels.welcome);
        Guild.publicModLogChannel = Guild.discordGuild.channels.find(channel => channel.id === Config.channels.publicModLog);
        Guild.anonymousMessagesChannel = Guild.discordGuild.channels.find(channel => channel.id === Config.channels.anonymousMessages);
        Guild.modLogChannel = Guild.discordGuild.channels.find(channel => channel.id === Config.channels.modLog);
        Guild.botChannel = Guild.discordGuild.channels.find(channel => channel.id === Config.channels.bot);
        Guild.automodChannel = Guild.discordGuild.channels.find(channel => channel.id === Config.channels.automod);

        // First delete old welcome messages and kick inactive new members
        await Guild.deleteOldWelcomeMessages();
        Guild.kickInactiveNewMembers();

        // Then add the ones that were not deleted to the map
        const welcomeMessages = await Guild.welcomeChannel.fetchMessages();
        welcomeMessages.map(message => {
            Guild.addMessageFromWelcomeToMap(message);
        });

        // So that if the member gets validated or leaves, we can delete all the related messages easily
        setInterval(() => {
            Guild.deleteOldWelcomeMessages();
            Guild.kickInactiveNewMembers();
        }, 60 * 60);
    },

    kickInactiveNewMembers: () => {
        Guild.discordGuild.members.filter(member => {
            const threeDaysElapsed = ((Date.now() - member.joinedTimestamp) >= 3 * 24 * 60 * 60 * 1000);
            const isOfficial = member.roles.has(Config.roles.officialMember);

            return !member.user.bot && threeDaysElapsed && !isOfficial;
        }).array().forEach(member => member.kick('[AUTO] Did not self assign roles'));
    },

    /**
     * @param {string} snowflake
     * @param {int} interval
     */
    addMemberToVoiceStateUpdateWatcher: (snowflake, interval) => {
        Guild.voiceMoveMembers[snowflake] = interval;
    },

    /**
     * @param {string} snowflake
     */
    removeMemberFromVoiceStateUpdateWatcher: (snowflake) => {
        delete Guild.voiceMoveMembers[snowflake];
    },

    /**
     * @param {GuildMember} oldMember
     * @param {GuildMember} newMember
     */
    voiceStateUpdateHandler: (oldMember, newMember) => {
        if (oldMember.voiceChannel !== undefined && newMember.voiceChannel !== undefined) {
            const memberIsBeingWatched = Object.keys(Guild.voiceMoveMembers).indexOf(oldMember.id) > -1;
            const sourceChannel = oldMember.voiceChannel;
            const destChannel = newMember.voiceChannel;
            const connectedInDifferentChannel = oldMember.voiceChannel.id !== newMember.voiceChannel.id;

            if (memberIsBeingWatched && connectedInDifferentChannel) {
                clearInterval(Guild.voiceMoveMembers[oldMember.id]);
                delete Guild.voiceMoveMembers[oldMember.id];

                sourceChannel.members.array().forEach(member => member.setVoiceChannel(destChannel));
            }
        }
    },

    /**
     * @param message
     * @returns {GuildMember|null}
     */
    getMemberFromMessage: (message) => {
        let member;

        if (message.guild === null) {
            member = Guild.discordGuild.member(message.author);
        } else {
            member = message.member;
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
     * @param {string} roleName
     * @returns {Role|null}
     */
    getRoleByName: (roleName) => {
        return Guild.discordGuild.roles.find(role => role.name.toLowerCase() === roleName.toLowerCase());
    },

    /**
     * @param {Message} message
     * @returns {Discord.RichEmbed}
     */
    messageToEmbed: (message) => {
        const member = message.member;
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
     */
    addMessageFromWelcomeToMap: (message) => {
        // If the author is not a bot, save this message as related to the author
        if (message.author.bot === false) {
            if (!Guild.memberMessageMap.has(message.author.id)) {
                Guild.memberMessageMap.set(message.author.id, []);
            }

            Guild.memberMessageMap.set(
                message.author.id,
                Guild.memberMessageMap.get(message.author.id).concat(message.id)
            );
        }

        // Then, take every mention and remove the author from them
        let mentions = message.mentions.members.concat(message.mentions.users);
        mentions.delete(message.author.id);

        // And consider this message to be related to the members mentioned
        if (mentions.size > 0) {
            mentions.map(user => {
                if (!Guild.memberMessageMap.has(user.id)) {
                    Guild.memberMessageMap.set(user.id, []);
                }

                Guild.memberMessageMap.set(
                    user.id,
                    Guild.memberMessageMap.get(user.id).concat(message.id)
                );
            });
        }
    },

    /**
     * @returns {Promise.<void>}
     */
    deleteOldWelcomeMessages: async () => {
        const welcomeMessages = await Guild.welcomeChannel.fetchMessages();

        welcomeMessages.map(message => {
            const tooOld = Date.now() - message.createdTimestamp >= 3 * SECONDS_IN_DAY;

            if (tooOld) {
                message.delete().catch(Logger.exception);
            }
        });
    },

    /**
     * @param {GuildMember} member
     */
    clearWelcomeMessagesForMember: (member) => {
        if (Guild.memberMessageMap.has(member.user.id)) {
            Guild.welcomeChannel.bulkDelete(Guild.memberMessageMap.get(member.user.id)).catch(Logger.exception);
            Guild.memberMessageMap.delete(member.user.id);
        }
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
            memberList.map(member => {
                const nickname = member.nickname !== null ? `${member.nickname.toLowerCase()}#${member.user.discriminator}` : '';
                const username = `${member.user.username.toLowerCase()}#${member.user.discriminator}`;

                if (nickname.indexOf(message.content) > -1 || username.indexOf(message.content) > -1) {
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