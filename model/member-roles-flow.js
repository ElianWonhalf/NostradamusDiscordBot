const Logger = require('@elian-wonhalf/pretty-logger');
const Config = require('../config.json');
const Guild = require('./guild');
const Country = require('./country');
const Language = require('./language');

const STEPS = [
    'isNative',
    'level'
];

const STRINGS_THAT_MEAN_YES = [
    'ye',
    'yee',
    'yes',
    'yeah',
    'yea',
    'ui',
    'oui',
    'ouip',
    'ouai',
    'ouais',
    'ouaip',
    'ya',
    'yep',
    'yup',
    'yip',
    'yay',
    'true',
    'vrai',
    'si'
];

const STRINGS_THAT_MEAN_NO = [
    'no',
    'noo',
    'noes',
    'noe',
    'non',
    'na',
    'nu',
    'niu',
    'nyu',
    'nuu',
    'niuu',
    'nyuu',
    'nuuu',
    'niuuu',
    'nyuuu',
    'nan',
    'naan',
    'nope',
    'nop',
    'nay',
    '0',
    'false',
    'faux',
    'nah',
    'meh'
];

const LEVELS = {
    // Native
    'natif': Guild.levelRolesIds.native,
    'native': Guild.levelRolesIds.native,
    'nativ': Guild.levelRolesIds.native,
    'natife': Guild.levelRolesIds.native,

    // Advanced
    'avancé': Guild.levelRolesIds.advanced,
    'avance': Guild.levelRolesIds.advanced,
    'advanced': Guild.levelRolesIds.advanced,
    'advance': Guild.levelRolesIds.advanced,
    'avanc': Guild.levelRolesIds.advanced,
    'adanced': Guild.levelRolesIds.advanced,
    'adance': Guild.levelRolesIds.advanced,
    'expert': Guild.levelRolesIds.advanced,
    'awesome': Guild.levelRolesIds.advanced,

    // Intermediate
    'intermédiaire': Guild.levelRolesIds.intermediate,
    'intermediaire': Guild.levelRolesIds.intermediate,
    'intermédaire': Guild.levelRolesIds.intermediate,
    'intermedaire': Guild.levelRolesIds.intermediate,
    'intermediair': Guild.levelRolesIds.intermediate,
    'intermediai': Guild.levelRolesIds.intermediate,
    'intermediate': Guild.levelRolesIds.intermediate,
    'intermedate': Guild.levelRolesIds.intermediate,
    'intermediat': Guild.levelRolesIds.intermediate,

    // Beginner
    'débutant': Guild.levelRolesIds.beginner,
    'debutant': Guild.levelRolesIds.beginner,
    'débutante': Guild.levelRolesIds.beginner,
    'debutante': Guild.levelRolesIds.beginner,
    'beginner': Guild.levelRolesIds.beginner,
    'beginer': Guild.levelRolesIds.beginner,
    'beginne': Guild.levelRolesIds.beginner,
    'beginn': Guild.levelRolesIds.beginner,
    'begin': Guild.levelRolesIds.beginner,
};

LEVELS[Guild.levelRoles.native.toLowerCase()] = Guild.levelRolesIds.native;
LEVELS[Guild.levelRoles.advanced.toLowerCase()] = Guild.levelRolesIds.advanced;
LEVELS[Guild.levelRoles.intermediate.toLowerCase()] = Guild.levelRolesIds.intermediate;
LEVELS[Guild.levelRoles.beginner.toLowerCase()] = Guild.levelRolesIds.beginner;

/**
 * @param {Array} words
 * @param {String} string
 * @returns {String|undefined}
 */
const wordsInString = (words, string) => {
    string = string.toLowerCase();

    return words.find(word => {
        return string.match(new RegExp(`\\b${word}\\b`)) !== null;
    });
};

const MemberRolesFlow = {
    /**
     * @param {Message} message
     */
    parse: async (message) => {
        let member = message.member;
        const nextStepIndex = MemberRolesFlow.getNextStepForMember(member, true);
        let intendedRoleAdded = null;
        const additionalRolesAdded = [];

        if (nextStepIndex < 1) {
            const isNative = wordsInString(STRINGS_THAT_MEAN_YES, message.content) !== undefined;
            const isNotNative = wordsInString(STRINGS_THAT_MEAN_NO, message.content) !== undefined;
            const confused = isNative === isNotNative;

            if (!confused) {
                intendedRoleAdded = Guild.discordGuild.roles.get(
                    isNative ? Config.roles.native : Config.roles.unknownLevel
                );
            }
        } else {
            const foundLevel = wordsInString(Object.keys(LEVELS), message.content);

            if (foundLevel !== undefined) {
                intendedRoleAdded = Guild.discordGuild.roles.get(LEVELS[foundLevel]);
                member = await member.removeRole(Config.roles.unknownLevel);
            }
        }

        if (intendedRoleAdded !== null && !member.roles.has(intendedRoleAdded)) {
            member = await member.addRole(intendedRoleAdded);
        }

        const countries = Country.getRoleAliasesList();
        const languages = Language.getRoleAliasesList();

        const foundCountry = wordsInString(countries, message.content);
        const foundLanguage = wordsInString(languages, message.content);

        if (foundCountry !== undefined) {
            const countryRole = Guild.getRoleByName(Country.getRoleNameFromString(foundCountry));

            if (!member.roles.has(countryRole)) {
                additionalRolesAdded.push(countryRole);
            }
        }

        if (foundLanguage !== undefined) {
            const languageRole = Guild.getRoleByName(Language.getRoleNameFromString(foundLanguage));

            if (!member.roles.has(languageRole)) {
                additionalRolesAdded.push(languageRole);
            }
        }

        if (additionalRolesAdded.length > 0) {
            member = await member.addRoles(additionalRolesAdded);
        }

        MemberRolesFlow.answerWithNextStep(
            message,
            member,
            nextStepIndex === MemberRolesFlow.getNextStepForMember(member, true)
        );
    },

    /**
     * @param {Message} message
     * @param {GuildMember} member
     * @param {boolean} [confused]
     */
    answerWithNextStep: async (message, member, confused) => {
        confused = confused || false;

        const nextStep = MemberRolesFlow.getNextStepForMember(member);

        if (nextStep !== null) {
            const callback = 'get' + nextStep.substr(0, 1).toUpperCase() + nextStep.substr(1) + 'StepMessage';
            message.reply(`\n\n${MemberRolesFlow[callback](confused)}`);
        } else {
            setTimeout(async () => {
                await member.addRole(Config.roles.officialMember);
                Guild.clearWelcomeMessagesForMember(member);
                Guild.beginnerChannel.send(trans('model.memberRolesFlow.validatedMessage', [member]));
            }, 15000);

            const roles = member.roles.array().filter(role => role.name !== '@everyone').map(role => role.name);
            const rolesString = `"${roles.join('", "')}"`;

            message.reply(
                `\n\n${trans('model.memberRolesFlow.endMessage', [rolesString])}`
            );
        }
    },

    /**
     * @param {GuildMember} member
     * @param {boolean} [useStepIndex]
     * @returns {string}
     */
    getNextStepForMember: (member, useStepIndex) => {
        useStepIndex = useStepIndex || false;

        let nextStep = null;

        for (let i = 0; i < STEPS.length && nextStep === null; i++) {
            const step = STEPS[i];
            const callback = 'is' + step.substr(0, 1).toUpperCase() + step.substr(1) + 'Needed';

            if (MemberRolesFlow[callback](member)) {
                nextStep = useStepIndex ? i : step;
            }
        }

        return nextStep;
    },

    /**
     * @param {GuildMember} member
     * @returns {boolean}
     */
    isIsNativeNeeded: (member) => {
        return !Guild.memberHasLevelRole(member) && !member.roles.has(Config.roles.unknownLevel);
    },

    /**
     * @param {GuildMember} member
     * @returns {boolean}
     */
    isLevelNeeded: (member) => {
        return !Guild.memberHasLevelRole(member) && member.roles.has(Config.roles.unknownLevel);
    },

    /**
     * @param {boolean} confused
     * @returns {string}
     */
    getIsNativeStepMessage: (confused) => {
        return trans(
            `model.memberRolesFlow.isNativeStep${confused ? 'Confused' : ''}Message`,
            [`%${Config.learntLanguage}%`]
        );
    },

    /**
     * @param {boolean} confused
     * @returns {string}
     */
    getLevelStepMessage: (confused) => {
        return trans(
            `model.memberRolesFlow.levelStep${confused ? 'Confused' : ''}Message`,
            [`%${Config.learntLanguage}%`]
        );
    },
};

module.exports = MemberRolesFlow;