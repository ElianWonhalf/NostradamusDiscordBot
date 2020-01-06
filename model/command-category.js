const CommandCategory = {
    MODERATION: 'moderation',
    BOT_MANAGEMENT: 'bot_management',
    FUN: 'fun',
    INFO: 'info',
    ROLE: 'role',
    MISC: 'misc'
};

CommandCategory.translations = {};

for (const commandCategory of Object.values(CommandCategory)) {
    CommandCategory.translations[commandCategory] = trans(`model.commandCategory.${commandCategory}`);
}

module.exports = CommandCategory;
