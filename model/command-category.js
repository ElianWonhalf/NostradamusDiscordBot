const CommandCategory = {
    MODERATION: 'moderation',
    BOT_CUSTOMIZATION: 'bot_customization'
};

CommandCategory.translations = {};

for (const commandCategory of Object.values(CommandCategory)) {
    CommandCategory.translations[commandCategory] = trans(`model.commandCategory.${commandCategory}`);
}

module.exports = CommandCategory;
