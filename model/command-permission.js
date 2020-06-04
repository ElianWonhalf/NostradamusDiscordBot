const Config = require('../config.json');
const Guild = require('./guild');

const CommandPermission = {
    /**
     * @param {Message} message
     * @returns {Promise.<boolean>}
     */
    isMommy: async (message) => {
        const member = await Guild.getMemberFromMessage(message);

        return member.id === Config.admin;
    },

    /**
     * @param {Message} message
     * @returns {Promise.<boolean>}
     */
    isMemberMod: async (message) => {
        const member = await Guild.getMemberFromMessage(message);

        return await Guild.isMemberMod(member);
    },

    /**
     * @param {Message} message
     * @returns {Promise.<boolean>}
     */
    isMemberModOrTutor: async (message) => {
        const member = await Guild.getMemberFromMessage(message);

        return await Guild.isMemberMod(member) || await Guild.isMemberTutor(member);
    },

    /**
     * @param {string} permission
     * @returns {function}
     */
    memberHasPermission: (permission) => {
        /**
         * @param {Message} message
         * @returns {Promise.<boolean>}
         */
        return async (message) => {
            const member = await Guild.getMemberFromMessage(message);

            return await member.hasPermission(permission);
        }
    },

    /**
     * @param {Message} message
     * @returns {Promise.<boolean>}
     */
    notInWelcome: async (message) => {
        return message.channel.id !== Config.channels.welcome;
    },

    /**
     * @param {Message} message
     * @returns {Promise.<boolean>}
     */
    inRoles: async (message) => {
        return message.channel.id === Config.channels.roles;
    },

    /**
     * @param {Message} message
     * @returns {Promise.<boolean>}
     */
    yes: async (message) => {
        return true;
    }
};

module.exports = CommandPermission;
