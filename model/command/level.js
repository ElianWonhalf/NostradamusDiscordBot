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
module.exports = async (message, args) => {
    if (message.guild === null || message.channel.id !== Config.channels.welcome) {
        return;
    }

    const member = Guild.getMemberFromMessage(message);
    const level = args.join(' ').toLowerCase().trim();

    if (member === null) {
        message.reply('sorry, an error happened, please contact the mods and give them your level in ' + Config.learntLanguage.english + ', your native language, and your country.');
        return;
    }

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
        let reply = '\n';

        if (level === '') {
            reply += '\nYou need to enter in a level. The command `' + Config.prefix + Config.levelCommand + '` alone does not tell me which level you are. For example: `' + Config.prefix + Config.levelCommand + ' beginner`';
            reply += '\nIl faut que tu spécifies un niveau. La commande `' + Config.prefix + Config.levelCommand + '` seule ne me permet pas de savoir quel est ton niveau en français. Par exemple : `' + Config.prefix + Config.levelCommand + ' débutant`';
        } else {
            reply += '\nThat level is not valid. Maybe you mispelled something? The levels are `beginner`, `intermediate`, `advanced` and `native`.';
            reply += '\nCe niveau n\'est pas valide. Peut-être que tu as fait une faute de frappe ? Les différents niveaux sont `débutant`, `intermédiaire`, `avancé` et `natif`.';
        }

        message.reply(reply);
    }
};
