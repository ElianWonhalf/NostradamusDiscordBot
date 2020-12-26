const Guild = require('./guild');

const Correction = {
    CORRECTION_EMOJI_NAME: '\u2731',

    /**
     * @param {MessageReaction} messageReaction
     * @param {User} user
     */
    handleReaction: async (messageReaction, user) => {
        if (!user.bot) {
            const member = await Guild.discordGuild.member(user);
            const message = messageReaction.message;
            const messageHasEmbeds = message.embeds && message.embeds.length > 0;
            const messageIsCorrectionResponse = messageHasEmbeds && /\[\]\(correction\)/gu.test(message.embeds[0].description);
            const nicknameAlreadyHasEmoji = Correction.memberNicknameHasEmoji(member);

            if (messageReaction.emoji.name === 'pollyes' && !nicknameAlreadyHasEmoji && messageIsCorrectionResponse) {
                await Correction.addEmojiToNickname(member);
            }
        }
    },

    /**
     * @param {MessageReaction} messageReaction
     * @param {User} user
     */
    handleReactionRemove: async (messageReaction, user) => {
        if (!user.bot) {
            const member = await Guild.discordGuild.member(user);
            const message = messageReaction.message;
            const messageHasEmbeds = message.embeds && message.embeds.length > 0;
            const messageIsCorrectionResponse = messageHasEmbeds && /\[\]\(correction\)/gu.test(message.embeds[0].description);
            const nicknameAlreadyHasEmoji = Correction.memberNicknameHasEmoji(member);

            if (messageReaction.emoji.name === 'pollyes' && nicknameAlreadyHasEmoji && messageIsCorrectionResponse) {
                await Correction.removeEmojiFromNickname(member);
            }
        }
    },

    /**
     * @param {GuildMember} member
     * @returns {boolean}
     */
    memberNicknameHasEmoji: (member) => {
        return new RegExp(`${regexEscape(Correction.CORRECTION_EMOJI_NAME)}$`, 'gu').test(member.displayName);
    },

    /**
     * @param {GuildMember} member
     * @returns {Promise<GuildMember>}
     */
    addEmojiToNickname: (member) => {
        return member.setNickname(`${member.displayName} ${Correction.CORRECTION_EMOJI_NAME}`);
    },

    /**
     * @param {GuildMember} member
     * @returns {Promise<GuildMember>}
     */
    removeEmojiFromNickname: (member) => {
        return member.setNickname(member.displayName.slice(0, -1 * (Correction.CORRECTION_EMOJI_NAME.length)).trim());
    }
};

module.exports = Correction;
