const fs = require('fs');
const Logger = require('@elian-wonhalf/pretty-logger');
const Config = require('../config.json');
const hueV3 = require('node-hue-api').v3;
const LightState = hueV3.lightStates.LightState;
const hueRemoteBootstrap = hueV3.api.createRemote(Config.hue.clientId, Config.hue.clientSecret);

class Hue
{
    constructor()
    {
        if (!fs.existsSync('cache')) {
            fs.mkdirSync('cache');
        }

        if (!fs.existsSync('cache/hue')) {
            fs.mkdirSync('cache/hue');
        }

        if (!fs.existsSync('cache/hue/credentials.json')) {
            fs.writeFileSync('cache/hue/credentials.json', JSON.stringify({
                code: null,
                accessToken: null,
                refreshToken: null
            }));
        }

        this.credentials = require('../cache/hue/credentials.json');
    }

    static get white()
    {
        return [254, 58172, 0, 153];
    }

    static get pink()
    {
        //return [255, 138, 204];
        return [254, 25500, 254, 153];
    }

    async flash(checkIfOn = false)
    {
        await this.init();

        if (!checkIfOn || (this.ceilingLight !== undefined && this.ceilingLight.state.on)) {
            const baseState = Object.assign({}, this.ceilingLight.state);
            const invertedState = Object.assign({}, this.ceilingLight.state);

            invertedState.on = !invertedState.on;

            await this._api.lights.setLightState(Config.hue.lights.ceiling, invertedState);
            await this._api.lights.setLightState(Config.hue.lights.ceiling, baseState);
            await this._api.lights.setLightState(Config.hue.lights.ceiling, invertedState);
            await this._api.lights.setLightState(Config.hue.lights.ceiling, baseState);
        }
    }

    async setColour(rgbOrHue)
    {
        await this.init();
        let colouredState = new LightState(this.ceilingLight.state);

        if (rgbOrHue.length === 3) {
            colouredState = colouredState.rgb(...rgbOrHue);
        } else {
            colouredState = colouredState.bri(rgbOrHue[0]).hue(rgbOrHue[1]).sat(rgbOrHue[2]).ct(rgbOrHue[3]);
        }

        await this._api.lights.setLightState(Config.hue.lights.ceiling, colouredState);

        return new Promise(async function (resolve) {
            setTimeout(resolve, 2000);
        });
    }

    async colourFlash(rgbOrHue)
    {
        await this.init();

        const baseState = new hueV3.lightStates.LightState();

        baseState.populate(this.ceilingLight.state);

        await this.setColour(rgbOrHue);
        await this.setColour(Hue.white);
        await this.setColour(rgbOrHue);
        await this.setColour(Hue.white);
        await this.setColour(rgbOrHue);

        setTimeout(async () => {
            await this._api.lights.setLightState(Config.hue.lights.ceiling, baseState);
        }, 2000);
    }

    async init()
    {
        const askCodeToMom = async () => {
            const mom = await bot.users.fetch(Config.admin);
            const request = await mom.send(trans('model.hue.needCode', [], 'en'));

            this._api = null;

            request.channel.awaitMessages(
                message => message.author.id === Config.admin,
                {max: 1}
            ).then(messages => {
                this.credentials.code = messages.first().content;
                fs.writeFileSync('cache/hue/credentials.json', JSON.stringify(this.credentials));
                this.init();
            });
        };

        const connectWithCode = async () => {
            this._api = await hueRemoteBootstrap.connectWithCode(this.credentials.code, null, 60000).catch(async (exception) => {
                Logger.error(exception.stack);
                Logger.exception(exception.response.data);
                await askCodeToMom();
            });
        };

        const refreshTokens = async () => {
            const tokens = await this._api.remote.refreshTokens().catch(console.error);

            this.credentials.accessToken = tokens.accessToken;
            this.credentials.refreshToken = tokens.refreshToken;

            fs.writeFileSync('cache/hue/credentials.json', JSON.stringify(this.credentials));
        };

        if (this.initialized !== true && this.initializing !== true) {
            this.initializing = true;

            if (this.credentials.accessToken === null) {
                Logger.warning('Tokens are missing, trying to connect to hue with code...');
                await connectWithCode();
            } else {
                this._api = await hueRemoteBootstrap.connectWithTokens(
                    this.credentials.accessToken,
                    this.credentials.refreshToken
                ).catch(async () => {
                    Logger.warning('Could not connect to hue with tokens, trying with code...');
                    await connectWithCode();
                });
            }

            if (this._api !== undefined && this._api !== null) {
                await this._api.lights.getAll().catch(async exception => {
                    Logger.exception(exception.stack);
                    await askCodeToMom();
                });

                this.ceilingLight = await this._api.lights.getLight(Config.hue.lights.ceiling).catch(exception => {
                    Logger.exception(exception.trace);
                });

                this.ceilingLightState = await this._api.lights.getLightState(Config.hue.lights.ceiling).catch(exception => {
                    Logger.exception(exception.trace);
                });
            }

            if (this._api !== undefined && this._api !== null) {
                this.initializing = false;
                this.initialized = true;
            } else {
                this.initializing = false;
                this.initialized = false;
            }
        }
    }
}

const hue = new Hue();

module.exports = hue;