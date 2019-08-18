const Logger = require('@elian-wonhalf/pretty-logger');
const Config = require('../config.json');
const Guild = require('./guild');

const STEPS = [
    'level',
    'nativeLanguage',
    'country'
];

const MemberRolesFlow = {
    /**
     * @param {Message} message
     * @param {GuildMember} member
     */
    answerWithNextStep: (message, member) => {
        const nextStep = MemberRolesFlow.getNextStepsForMember(member);
        let reply;

        if (nextStep !== null) {
            const callback = 'get' + nextStep.substr(0, 1).toUpperCase() + nextStep.substr(1) + 'StepMessage';
            message.reply(`\n\n ${MemberRolesFlow[callback]()}`);
        } else {
            setTimeout(() => Guild.clearWelcomeMessagesForMember(member), 5000);
            member.addRole(Config.roles.officialMember);

            reply = trans('model.memberRolesFlow.validatedDM', [`<#${Config.channels.beginner}>`]);

            member.user.send(reply).catch(exception => {
                Logger.error(exception.toString())
            });
        }
    },

    /**
     * @param {GuildMember} member
     * @returns {string}
     */
    getNextStepsForMember: (member) => {
        let nextStep = null;

        for (let step of STEPS) {
            const callback = 'is' + step.substr(0, 1).toUpperCase() + step.substr(1) + 'Needed';

            if (MemberRolesFlow[callback](member)) {
                nextStep = step;
                break;
            }
        }

        return nextStep;
    },

    /**
     * @param {GuildMember} member
     * @returns {boolean}
     */
    isLevelNeeded: (member) => {
        return !Guild.memberHasLevelRole(member);
    },

    /**
     * @param {GuildMember} member
     * @returns {boolean}
     */
    isNativeLanguageNeeded: (member) => {
        return !Guild.isMemberNative(member) && !Guild.memberHasLanguageRole(member);
    },

    /**
     * @param {GuildMember} member
     * @returns {boolean}
     */
    isCountryNeeded: (member) => {
        return !Guild.memberHasCountryRole(member);
    },

    /**
     * @returns {string}
     */
    getLevelStepMessage: () => {
        const command = Config.prefix + Config.levelCommand;

        return trans(
            'model.memberRolesFlow.levelStepMessage',
            [`%${Config.learntLanguage}%`, command, command]
        );
    },

    /**
     * @returns {string}
     */
    getNativeLanguageStepMessage: () => {
        return trans(
            'model.memberRolesFlow.nativeLanguageStepMessage',
            [Config.prefix, Config.prefix]
        );
    },

    /**
     * @returns {string}
     */
    getCountryStepMessage: () => {
        return trans(
            'model.memberRolesFlow.countryStepMessage',
            [Config.prefix, Config.prefix, Config.prefix]
        );
    }
};

module.exports = MemberRolesFlow;