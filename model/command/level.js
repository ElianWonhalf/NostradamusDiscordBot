const Config = require('../../config.json');
const Guild = require('../guild');
const MemberRolesFlow = require('../member-roles-flow');

const levels = {
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
    'intermediair': Guild.levelRolesIds.intermediate,
    'intermediai': Guild.levelRolesIds.intermediate,
    'intermediate': Guild.levelRolesIds.intermediate,
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

levels[Guild.levelRoles.native.toLowerCase()] = Guild.levelRolesIds.native;
levels[Guild.levelRoles.advanced.toLowerCase()] = Guild.levelRolesIds.advanced;
levels[Guild.levelRoles.intermediate.toLowerCase()] = Guild.levelRolesIds.intermediate;
levels[Guild.levelRoles.beginner.toLowerCase()] = Guild.levelRolesIds.beginner;

/**
 * @param {Message} message
 * @param {Array} args
 */
module.exports = {
    aliases: ['rank', Config.levelCommand],
    process: async (message, args) => {
        if (message.guild === null || message.channel.id !== Config.channels.welcome) {
            return;
        }

        const member = message.member;
        const level = args.join(' ').toLowerCase().trim();

        const rolesToRemove = member.roles.array().filter(
            role => Object.values(Guild.levelRoles).indexOf(role.name) > -1
        );

        if (levels.hasOwnProperty(level)) {
            const role = levels[level];

            if (rolesToRemove.length > 0) {
                await member.removeRoles(rolesToRemove);
            }

            member.addRole(role).then((member) => {
                MemberRolesFlow.answerWithNextStep(message, member);
            });
        } else {
            const levelCommand = Config.prefix + Config.levelCommand;

            if (level === '') {
                message.reply(`\n${trans('model.command.level.missingArgument', [levelCommand, levelCommand])}`);
            } else {
                message.reply(`\n${trans('model.command.level.invalidLevel')}`);
            }
        }
    }
};
