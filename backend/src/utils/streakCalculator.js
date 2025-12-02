const { DATE_CONSTANTS } = require("../config/constants");
function calculateStreak(logs) {
    if (!logs || logs.length === 0) {
        return { current: 0, longest: 0 };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLog = logs.find((log) => {
        const logDate = new Date(log.log_date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
    });
    let checkDate = todayLog
        ? today
        : new Date(today.getTime() - DATE_CONSTANTS.MS_PER_DAY);
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    for (const log of logs) {
        const logDate = new Date(log.log_date);
        logDate.setHours(0, 0, 0, 0);
        if (logDate.getTime() === checkDate.getTime()) {
            tempStreak++;
            checkDate = new Date(checkDate.getTime() - DATE_CONSTANTS.MS_PER_DAY);
        } else {
            if (tempStreak > longestStreak) {
                longestStreak = tempStreak;
            }
            tempStreak = 0;
            break;
        }
    }
    if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
    }
    currentStreak = todayLog ? tempStreak : 0;
    tempStreak = 0;
    let prevDate = null;
    for (const log of logs) {
        const logDate = new Date(log.log_date);
        logDate.setHours(0, 0, 0, 0);
        if (!prevDate || logDate.getTime() === prevDate - DATE_CONSTANTS.MS_PER_DAY) {
            tempStreak++;
        } else {
            if (tempStreak > longestStreak) {
                longestStreak = tempStreak;
            }
            tempStreak = 1;
        }
        prevDate = logDate.getTime();
    }
    if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
    }
    return { current: currentStreak, longest: longestStreak };
}
function calculateCurrentStreak(logs) {
    if (!logs || logs.length === 0) {
        return 0;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayLog = logs.find((log) => {
        const logDate = new Date(log.log_date);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
    });
    let checkDate = todayLog
        ? today
        : new Date(today.getTime() - DATE_CONSTANTS.MS_PER_DAY);
    let currentStreak = 0;
    for (const log of logs) {
        const logDate = new Date(log.log_date);
        logDate.setHours(0, 0, 0, 0);
        if (logDate.getTime() === checkDate.getTime()) {
            currentStreak++;
            checkDate = new Date(checkDate.getTime() - DATE_CONSTANTS.MS_PER_DAY);
        } else {
            break;
        }
    }
    return currentStreak;
}
module.exports = {
    calculateStreak,
    calculateCurrentStreak,
};
