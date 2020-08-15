const Logger = require('@lilywonhalf/pretty-logger');
const WatchedMember = require('../../watched-member');

/**
 * @param {Message} message
 * @param {Array} args
 * @param {Array<User|GuildMember>} targets
 */
module.exports = async (message, args, targets) => {
    for (const target of targets) {
        WatchedMember.remove(target.id).then(() => {
            message.channel.send(trans(
                'model.command.watch.remove.success',
                [target.toString()],
                'en'
            ));
        }).catch((error) => {
            Logger.error(error.message);
        });
    }
};
