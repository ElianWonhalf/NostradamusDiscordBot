const Discord = require('discord.js');

class Cooldown
{
    static instance = null;

    constructor() {
        if (this.constructor.instance !== null) {
            return this.constructor.instance;
        }

        this._configuration = new Discord.Collection();
        this._lastCalled = new Discord.Collection();
    }

    /**
     * @param {string} key
     * @param {Number} delay
     *
     * @returns {Cooldown}
     */
    setConfiguration(key, delay) {
        this._configuration.set(key, delay);

        return this;
    }

    /**
     * @param {string} key
     *
     * @returns {Cooldown}
     */
    registerCall(key) {
        this._lastCalled.set(key, new Date().getTime());

        return this;
    }

    /**
     * @param {string} key
     *
     * @returns {boolean}
     */
    canCall(key) {
        const hasLastCalled = this._lastCalled.has(key);
        const now = new Date().getTime();
        const lastCalled = hasLastCalled ? this._lastCalled.get(key) : 0;
        const delay = this._configuration.get(key);

        return !hasLastCalled || now - lastCalled >= delay;
    }
}

module.exports = new Cooldown();