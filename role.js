const Channel = require('./channel');
const db = require('./db');

const Role = {};

// general roles mapping ( discord role name -> [ role name variants ] )
Role.aliases = {
    // french levels
    'Débutant': ['beginner', 'débutant', 'debutant', 'débutante', 'debutante'],
    'Intermédiaire': ['intermediate', 'intermédiaire', 'intermediaire'],
    'Avancé': ['advanced', 'avancé', 'avance', 'avancée', 'avancee'],
    'Francophone Natif': ['native', 'natif'],
    // others
    'États-Unis': ['united states of america', 'united states', 'america', 'usa', 'us',
                   'états-unis', 'etats-unis', 'états unis', 'etats unis'],
    'Royaume-Uni': ['united kingdom', 'uk']
};

// general roles reverse mapping ( role name variant -> discord role name )
Role.names = {};
for (let [role, aliases] of Object.entries(Role.aliases)) {
    for (let alias of aliases) Role.names[alias] = role
}

Role.frenchLevelRoles = [
    Role.names.beginner,
    Role.names.intermediate,
    Role.names.advanced,
    Role.names.native
];

Role.frenchLevelNames = {};
Object.entries(Role.names)
    .filter(([k,v]) => Role.frenchLevelRoles.includes(v))
    .reduce((obj, [k, v]) => { obj[k] = v; return obj; }, frenchLevelNames);

Role.languages = [];
Role.languagesFriendly = [];
Role.countries = [];
Role.countriesFriendly = [];
Role.NO_COUNTRY = 'SANS PAYS';
Role.NO_LANGUAGE = 'SANS LANGUE';
Role.alts = {};

// possible names for each role
Role.alts = Object.assign(Role.alts, Role.names);

const init = () => {
    db.query('SELECT * FROM languages').on('result', function(row) {
        Role.names[row.friendly.toLowerCase()] = row.role;
		Role.alts[row.role.toLowerCase()] = row.role;

        if (!Role.languages.includes(row.role)) {
            Role.languages.push(row.role);
            Role.languagesFriendly.push(row.friendly);
        }
    }).on('error', function(err) {
        Channel.logInChannel('Error loading languages: ' + err);
    }).on('end', function() {
        // sort alpha
        Role.languagesFriendly.sort();
    });

    db.query('SELECT * FROM countries').on('result', function(row) {
        Role.names[row.friendly.toLowerCase()] = row.role;
        Role.alts[row.role.toLowerCase()] = row.role;

        if (!Role.countries.includes(row.role)) {
            Role.countries.push(row.role);
            Role.countriesFriendly.push(row.friendly);
        }
    }).on('error', function(err) {
        Channel.logInChannel('Error loading countries: ' + err);
    }).on('end', function() {
        // all rows have been received
        Role.countriesFriendly.sort();
    });
};

init();

Role.add = (english, french, type) => {
	db.query('SET NAMES utf8');

	if (type === 'countries' || type === 'languages') {
        if (type === 'countries') {
            Role.countries.push(french);
            Role.countriesFriendly.push(english);
        } else {
            Role.languages.push(french);
            Role.languagesFriendly.push(english);
        }

        const start = 'INSERT INTO ' + type;
        db.query(start + ' (friendly, role) VALUES (?, ?)', [english, french], function (error) {
            if (error) {
                Channel.logInChannel('error adding role to database:' + error);
            } else {
                Channel.logInChannel('added ' + english + '|' + french + ' to ' + type + ' table');
            }
        });
	}
};

// helper functions
Role.isLanguageRole = (role) => {
    return Role.languagesFriendly.some(function(el) {
        return el.toLowerCase() === role.toLowerCase();
    });
};

Role.isCountryRole = (role) => {
    return Role.countriesFriendly.some(function(el) {
        return el.toLowerCase() === role.toLowerCase();
    });
};

Role.createRole = (guild, name) => {
    return guild.createRole({ name: name, permissions: [] });
};

module.exports = Role;
