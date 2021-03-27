const Config = require('../config.json');
const Guild = require('./guild');

const CommandPermission = {
    /**
     * @param {Array<Promise>} comparators
     * @returns {Function}
     */
    or: (...comparators) => {
        return async (message) => {
            let result = false;

            for (const comparator of comparators) {
                result |= await comparator(message.member);
            }

            return result;
        };
    },

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
    isMemberModOrSoft: async (message) => {
        const member = await Guild.getMemberFromMessage(message);

        return await Guild.isMemberMod(member) || await Guild.isMemberSoft(member);
    },

    /**
     * @param {Message} message
     * @returns {Promise.<boolean>}
     */
    isMemberModOrTutor: async (message) => {
        const member = await Guild.getMemberFromMessage(message);

        return await Guild.isMemberMod(member) || await Guild.isMemberTutor(member);
    },

    /**
     * @param {Message} message
     * @returns {Promise.<boolean>}
     */
    isMemberModOrSoftOrTutor: async (message) => {
        const member = await Guild.getMemberFromMessage(message);

        return await Guild.isMemberMod(member) || await Guild.isMemberSoft(member) || await Guild.isMemberTutor(member);
    },

    /**
     * @param {Message} message
     * @returns {Promise.<boolean>}
     */
    isMemberAnimator: async (message) => {
        const member = await Guild.getMemberFromMessage(message);

        return await Guild.isMemberAnimator(member);
    },

    /**
     * @param {Message} message
     * @returns {Promise.<boolean>}
     */
    isMemberModOrSoftOrAnimator: async (message) => {
        const member = await Guild.getMemberFromMessage(message);

        return await Guild.isMemberMod(member) || await Guild.isMemberSoft(member) || await Guild.isMemberAnimator(member);
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

            return member.hasPermission(permission);
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
