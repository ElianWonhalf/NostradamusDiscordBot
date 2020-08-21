const Config = require('../../config.json');
const Guild = require('../guild');
const Language = require('../language');
const Country = require('../country');
const CommandCategory = require('../command-category');
const CommandPermission = require('../command-permission');

class Audit
{
    static instance = null;

    constructor() {
        if (Audit.instance !== null) {
            return Audit.instance;
        }

        this.aliases = [];
        this.category = CommandCategory.ADMINISTRATION;
        this.isAllowedForContext = CommandPermission.isMemberModOrSoft;
    }

    /**
     * @param {Message} message
     */
    async process(message) {
        let answer = '\n';

        const languagesList = Language.getRoleNameList();
        const countriesList = Country.getRoleNameList();
        const rolesList = Guild.discordGuild.roles.cache.array().map(role => role.name);

        answer += trans('model.command.audit.totalLanguagesAndCountriesInDB', [languagesList.length, countriesList.length], 'en');
        answer += trans('model.command.audit.totalRolesOnServer', [rolesList.length], 'en');

        const languagesWithoutRoles = languagesList.filter(language => rolesList.indexOf(language) < 0);
        const countriesWithoutRoles = countriesList.filter(country => rolesList.indexOf(country) < 0);

        answer += trans('model.command.audit.languagesInDbWithoutRole', [languagesWithoutRoles.length], 'en');
        if (languagesWithoutRoles.length > 0) {
            answer += `\n\n${languagesWithoutRoles.join(', ')}`;
        }

        answer += trans('model.command.audit.countriesInDbWithoutRole', [countriesWithoutRoles.length], 'en');
        if (countriesWithoutRoles.length > 0) {
            answer += `\n\n${countriesWithoutRoles.join(', ')}`;
        }

        const mergedDBEntries = languagesList + countriesList + Config.notCountryOrLanguageRoles;
        const rolesWithoutDBEntry = rolesList.filter(role => mergedDBEntries.indexOf(role) < 0);

        answer += trans('model.command.audit.rolesWithoutDbEntry', [rolesWithoutDBEntry.length], 'en');
        if (rolesWithoutDBEntry.length > 0) {
            answer += `\n\n${rolesWithoutDBEntry.join(', ')}`;
        }

        message.reply(answer);
    }
}

module.exports = new Audit();
