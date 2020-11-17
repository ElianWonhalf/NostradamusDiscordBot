const Guild = require('./guild');

class Correspondence
{
    /**
     * @param {Snowflake} snowflake
     * @returns {Message|null}
     */
    async findIntroduction(snowflake)
    {
        const learnersMessages = await Guild.fetchAllChannelMessages(Guild.correspondenceLearnersChannel, true);
        let introduction = learnersMessages.find(
            message => message.mentions.users.some(user => user.id === snowflake)
        );

        if (!introduction) {
            const nativesMessages = await Guild.fetchAllChannelMessages(Guild.correspondenceNativesChannel, true);
            introduction = nativesMessages.find(
                message => message.mentions.users.some(user => user.id === snowflake)
            );
        }

        return introduction || null;
    }
}

module.exports = new Correspondence();
