const axios = require('axios');
const Logger = require('@lilywonhalf/pretty-logger');
const Config = require('../config.json');

const Trello = {
    BASE_URL: 'https://api.trello.com/1',
    KEY: Config.trello.key,
    TOKEN: Config.trello.token,
    ID_BOARD_FRENCH: '5c83fd2dd8cb02816b43dc00',
    ID_LIST_TODO: '5c83fd33cd3b4d50de63913e',
    ID_LIST_VOTES: '5c84253c8278d96398595e38',

    call: async (uri, data, method) => {
        data = Object.assign({key: Trello.KEY, token: Trello.TOKEN}, (data || {}));
        method = method || 'GET';

        if (!uri.startsWith('/')) {
            uri = `/${uri}`;
        }

        data = Object.keys(data)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
            .join('&');

        const queryConfig = {
            method: method.toUpperCase(),
            url: `${Trello.BASE_URL}${uri}?${data}`
        };

        const response = await axios(queryConfig).catch(exception => {
            Logger.exception(exception);
            throw exception;
        });

        return response.data;
    }
}


module.exports = Trello;
