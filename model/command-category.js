const CommandCategory = {
    MODERATION: 'moderation',
    ADMINISTRATION: 'administration',
    BOT_MANAGEMENT: 'bot_management',
    FUN: 'fun',
    INFO: 'info',
    ROLE: 'role',
    MISC: 'misc'
};

const categories = Object.values(CommandCategory);
CommandCategory.translations = {};

for (const category of categories) {
    CommandCategory.translations[category] = trans(`model.commandCategory.${category}`);
}

module.exports = CommandCategory;
