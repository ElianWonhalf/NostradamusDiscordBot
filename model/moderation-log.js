const Guild = require('./guild');

const ModerationLog = {
    memberLeftDate: null,
    auditLogFetchInterval: 5 * 60 * 1000, // 5 minutes
    searchAuditLogTimeout: null,
    membersWhoLeft: {},
    lastFetchedAuditLogId: null,

    processMemberRemove: (member) => {
        const nowDate = new Date();
        const nowTime = nowDate.getTime();
        const lastLogDateIsNull = ModerationLog.memberLeftDate === null;
        const elapsedTimeSinceLastLog = lastLogDateIsNull ? 0 : nowTime - ModerationLog.memberLeftDate.getTime();
        const canLogNow = lastLogDateIsNull || elapsedTimeSinceLastLog >= ModerationLog.auditLogFetchInterval;

        ModerationLog.membersWhoLeft[member.id] = null;
        debug(`Detected member leaving: ${member.user.username}`);

        if (!canLogNow && ModerationLog.searchAuditLogTimeout === null) {
            debug('Cannot log now, and no timeout set; setting a timeout');
            ModerationLog.searchAuditLogTimeout = setTimeout(
                ModerationLog.doLog,
                ModerationLog.auditLogFetchInterval - elapsedTimeSinceLastLog
            );
        } else if (canLogNow) {
            debug('Can log now');
            ModerationLog.doLog();
        } else {
            debug('Cannot log now, and a timeout is set');
        }

        ModerationLog.memberLeftDate = nowDate;
    },

    doLog: async () => {
        const memberIds = Object.keys(ModerationLog.membersWhoLeft);

        ModerationLog.searchAuditLogTimeout = null;

        debug(`Starting moderation logging; memberIds.length = ${memberIds.length}`);
        if (memberIds.length > 0) {
            const auditLogs = await Guild.discordGuild.fetchAuditLogs({
                after: ModerationLog.lastFetchedAuditLogId,
            });

            ModerationLog.lastFetchedAuditLogId = auditLogs.entries.first().id;
            debug(`${auditLogs.entries.size} entr${auditLogs.entries.size > 1 ? 'ies' : 'y'} in the audit log before filtering`);

            const entries = auditLogs.entries.filter(entry => {
                const userTarget = entry.targetType === 'USER';
                const kickOrBan = entry.action === 'MEMBER_KICK' || entry.action === 'MEMBER_BAN_ADD';
                const inList = entry.target !== undefined && memberIds.indexOf(entry.target.id) > -1;
                const notAuto = entry.reason === null || entry.reason.match('[AUTO]') === null;

                return userTarget && kickOrBan && inList && notAuto;
            });

            debug(`${entries.size} entr${auditLogs.entries.size > 1 ? 'ies' : 'y'} in the audit log after filtering`);

            entries.forEach(entry => {
                if (ModerationLog.membersWhoLeft[entry.target.id] === null) {
                    let log = `Membre <@${entry.target.id}> ${entry.target.username}#${entry.target.discriminator}`;

                    switch (entry.action) {
                        case 'MEMBER_KICK':
                            log = `${log} expulsé`;
                            break;

                        case 'MEMBER_BAN_ADD':
                            log = `${log} banni`;
                            break;
                    }

                    if (entry.reason !== null) {
                        const reason = entry.reason.replace(/https?:\/\/[^\s.]+\.[^\s]+/g, '[CENSORED LINK]');
                        log = `${log} pour la raison suivante : ${reason}`;
                    } else {
                        Guild.modLogChannel.send(`Hey @everyone, I just posted an entry in the public mod log that doesn't have a reason. Remember to **ALWAYS** input a reason when you kick or ban someone! Can someone go to the public log channel and provide the reason, like "Oh à propos de @machin, il a été ban parce que [RAISON]." please? Thank you ♥ !\nhttps://i.discord.fr/lQRn.gif`);
                    }

                    ModerationLog.membersWhoLeft[entry.target.id] = log;
                }
            });

            for (const memberId in ModerationLog.membersWhoLeft) {
                if (ModerationLog.membersWhoLeft.hasOwnProperty(memberId) && ModerationLog.membersWhoLeft[memberId] !== null) {
                    Guild.publicModLogChannel.send(ModerationLog.membersWhoLeft[memberId]);
                }
            }
        }

        ModerationLog.membersWhoLeft = {};
    }
};

module.exports = ModerationLog;