const Config = require('../../config.json');
const Guild = require('../guild');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

/**
 * @param {string} roleSnowflake
 * @param {boolean} adding 
 */
const handlePronoun = async (roleSnowflake, adding) => {
    const role = Guild.discordGuild.roles.cache.get(roleSnowflake);
        
    if (member.roles.cache.has(role.id)) {
        if (!adding) {
            await member.roles.remove(role.id).then(() => {
                message.reply(trans('model.command.pronouns.removed', [role.name]));
            });
        }
    } else {
        await member.roles.add(role.id).then(() => {
            message.reply(trans('model.command.pronouns.added', [role.name]));
        });
    }
};

class Pronouns
{
    static instance = null;

    constructor() {
        if (Pronouns.instance !== null) {
            return Pronouns.instance;
        }

        this.aliases = [
            'he',
            'him',
            'il',
            'she',
            'her',
            'elle',
            'they',
            'them',
            'iel',
            'pronoms',
            'pronoun',
            'pronom',
        ];
        this.category = CommandCategory.ROLE;
        this.isAllowedForContext = CommandPermission.notInWelcome;
    }

    /**
     * @param {Message} message
     * @param {Array} args
     * @param {string} calledCommand
     */
    async process(message, args, calledCommand) {
        const member = await Guild.getMemberFromMessage(message);
        const pronounsToHandle = [];
        let adding = false;
        const roleMap = {
            'he': Config.roles.he,
            'him': Config.roles.he,
            'il': Config.roles.he,
            'she': Config.roles.she,
            'her': Config.roles.she,
            'elle': Config.roles.she,
            'they': Config.roles.they,
            'them': Config.roles.they,
            'iel': Config.roles.they,
        };

        if (Object.keys(roleMap).includes(calledCommand)) {
            pronounsToHandle.push(roleMap[calledCommand]);
            adding = adding || !member.roles.cache.has(roleMap[calledCommand]);
        }
        
        for (let arg of args.map(arg => arg.toLowerCase())) {
            if (Object.keys(roleMap).includes(arg) && !pronounsToHandle.includes(roleMap[arg])) {
                pronounsToHandle.push(roleMap[arg]);
                adding = adding || !member.roles.cache.has(roleMap[arg]);
            }
        }

        if (pronounsToHandle.length > 0) {
            for (let roleSnowflake of pronounsToHandle) {
                await handlePronoun(roleSnowflake, adding);
            }
        } else {
            message.reply(trans('model.command.pronouns.reply'));
        }
    }
}

module.exports = new Pronouns();