/**
 * @param {Message} message
 */
module.exports = {
    aliases: [],
    process: async (message) => {
        message.channel.send(
            trans(
                `model.command.reply.${Math.random() < 0.92 ? 'calisse' : 'tabarnak'}`,
                [],
                'fr'
            )
        );
    }
};
