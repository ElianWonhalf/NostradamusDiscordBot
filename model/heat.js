const Cooldown = require('./cooldown');

class Heat
{
    /**
     * @param {Number} delay
     */
    constructor(delay) {
        this._cooldown = Cooldown;
        this._key = this.constructor.name.toLowerCase();

        this._cooldown.setConfiguration(this._key, delay);
    }

    registerCall() {
        this._cooldown.registerCall(this._key);
    }

    /**
     * @returns {boolean}
     */
    canCall() {
        return this._cooldown.canCall(this._key);
    }
}

module.exports = Heat;