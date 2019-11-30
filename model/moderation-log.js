const Config = require('../config.json');
const Guild = require('./guild');

const ModerationLog = {
    memberLeftDate: null,
    auditLogFetchInterval: 5 * 60 * 1000, // 5 minutes
    searchAuditLogTimeout: null,
    membersWhoLeft: {},
    lastFetchedAuditLogId: null,
    language: Config.botLanguage.split(',')[0],

    processMemberRemove: (member, forceLogNow) => {
        forceLogNow = forceLogNow || false;

        const nowDate = new Date();
        const nowTime = nowDate.getTime();
        const lastLogDateIsNull = ModerationLog.memberLeftDate === null;
        const elapsedTimeSinceLastLog = lastLogDateIsNull ? 0 : nowTime - ModerationLog.memberLeftDate.getTime();
        const canLogNow = lastLogDateIsNull || elapsedTimeSinceLastLog >= ModerationLog.auditLogFetchInterval;

        ModerationLog.membersWhoLeft[member.id] = null;
        debug(`Detected member leaving: ${member.user.username}`);

        if (!forceLogNow && !canLogNow && ModerationLog.searchAuditLogTimeout === null) {
            debug('Cannot log now, and no timeout set; setting a timeout');
            ModerationLog.searchAuditLogTimeout = setTimeout(
                ModerationLog.doLog,
                ModerationLog.auditLogFetchInterval - elapsedTimeSinceLastLog
            );
        } else if (canLogNow || forceLogNow) {
            debug('Can log now');

            clearTimeout(ModerationLog.searchAuditLogTimeout);
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
                const notAuto = entry.reason === null || entry.reason.indexOf('[AUTO]') < 0;

                if (inList && (!userTarget || !kickOrBan || !notAuto)) {
                    debug(`Removed entry corresponding to user`);

                    debug(`userTarget: ${userTarget ? 'true' : 'false'}`);
                    debug(`entry.targetType: ${entry.targetType}`);

                    debug(`kickOrBan: ${kickOrBan ? 'true' : 'false'}`);
                    debug(`entry.action: ${entry.action}`);

                    debug(`notAuto: ${notAuto ? 'true' : 'false'}`);
                    debug(`entry.reason: ${entry.reason}`);
                    if (entry.reason !== null) {
                        debug(`entry.reason.indexOf('[AUTO]'): ${entry.reason.indexOf('[AUTO]')}`);
                    }
                }

                return userTarget && kickOrBan && inList && notAuto;
            });

            debug(`${entries.size} entr${auditLogs.entries.size > 1 ? 'ies' : 'y'} in the audit log after filtering`);

            entries.forEach(entry => {
                if (ModerationLog.membersWhoLeft[entry.target.id] === null) {
                    const member = trans(
                        'model.moderationLog.member',
                        [`<@${entry.target.id}> ${entry.target.username}#${entry.target.discriminator}`],
                        ModerationLog.language
                    );

                    let action = '';
                    let reason = '';

                    switch (entry.action) {
                        case 'MEMBER_KICK':
                            action = trans('model.moderationLog.kicked', [], ModerationLog.language);
                            break;

                        case 'MEMBER_BAN_ADD':
                            action = trans('model.moderationLog.banned', [], ModerationLog.language);
                            break;
                    }

                    if (entry.reason !== null) {
                        reason = entry.reason.replace(/https?:\/\/[^\s.]+\.[^\s]+/g, '[CENSORED LINK]');
                        reason = trans('model.moderationLog.reason', [reason], ModerationLog.language);
                    } else {
                        Guild.modLogChannel.send(trans('model.moderationLog.missingReason'));
                    }

                    ModerationLog.membersWhoLeft[entry.target.id] = `${member} ${action} ${reason}`;
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