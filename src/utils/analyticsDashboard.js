export function formatYMD(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, '0');
    const d = String(dateObj.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export function addDays(dateObj, n) {
    const d = new Date(dateObj);
    d.setDate(d.getDate() + n);
    return d;
}

export function shortDayLabel(dateKey) {
    const d = new Date(`${dateKey}T12:00:00`);
    return d.toLocaleDateString('en-US', { weekday: 'short' });
}

export function shortMonthLabel(dateKey) {
    return dateKey.slice(0, 7);
}

/** Full dashboard stats + tomato meta (for analytics page). */
export function computeDashboardStats(analytics) {
    const todayKey = formatYMD(new Date());
    const today = analytics.find((d) => d.date === todayKey) || { totalWorkDuration: 0, pomodoroCount: 0 };
    const now = new Date();
    const weekStartKey = formatYMD(addDays(now, -6));
    const monthStartKey = formatYMD(addDays(now, -30));
    const weekRange = analytics.filter((d) => d.date >= weekStartKey && d.date <= todayKey);
    const monthRange = analytics.filter((d) => d.date >= monthStartKey && d.date <= todayKey);

    const totalPomodorosAllTime = analytics.reduce((s, d) => s + (d.pomodoroCount || 0), 0);
    const weekPomodoros = weekRange.reduce((s, d) => s + (d.pomodoroCount || 0), 0);
    const weekDuration = weekRange.reduce((s, d) => s + (d.totalWorkDuration || 0), 0);
    const monthPomodoros = monthRange.reduce((s, d) => s + (d.pomodoroCount || 0), 0);

    const longestFocusSeconds = analytics.reduce((max, d) => Math.max(max, d.totalWorkDuration || 0), 0);

    let streak = 0;
    for (let i = 0; i < 365; i++) {
        const d = formatYMD(addDays(now, -i));
        const row = analytics.find((a) => a.date === d);
        if (row && (row.pomodoroCount > 0 || row.totalWorkDuration > 0)) streak++;
        else break;
    }

    const totalPomodoros = weekRange.reduce((s, d) => s + (d.pomodoroCount || 0), 0);
    const avgPomodoroLength =
        totalPomodoros > 0
            ? Math.round(weekRange.reduce((s, d) => s + (d.totalWorkDuration || 0), 0) / totalPomodoros / 60)
            : 0;
    const completionRate =
        weekRange.length > 0
            ? Math.round((weekRange.filter((d) => (d.pomodoroCount || 0) > 0).length / 7) * 100)
            : 0;

    const POMS_PER_LEVEL = 20;
    const tomatoLevel =
        totalPomodorosAllTime === 0 ? 0 : Math.floor((totalPomodorosAllTime - 1) / POMS_PER_LEVEL) + 1;
    const levelProgressBase = Math.floor(totalPomodorosAllTime / POMS_PER_LEVEL) * POMS_PER_LEVEL;
    const levelProgressNext = levelProgressBase + POMS_PER_LEVEL;
    const progressWithinLevel = Math.min(1, (totalPomodorosAllTime - levelProgressBase) / POMS_PER_LEVEL);

    let variety = 'Cherry Tomato';
    if (tomatoLevel >= 4 && tomatoLevel <= 6) variety = 'Roma Tomato';
    else if (tomatoLevel >= 7 && tomatoLevel <= 9) variety = 'Heirloom Tomato';
    else if (tomatoLevel >= 10) variety = 'Beefsteak Tomato';

    let growthStage = 'Seed';
    if (weekPomodoros >= 1 && weekPomodoros <= 2) growthStage = 'Sprout';
    else if (weekPomodoros >= 3 && weekPomodoros <= 4) growthStage = 'Flowering';
    else if (weekPomodoros >= 5 && weekPomodoros <= 6) growthStage = 'Green fruit';
    else if (weekPomodoros >= 7) growthStage = 'Ripe tomato';

    return {
        todayCount: today.pomodoroCount || 0,
        weekCount: weekPomodoros,
        monthCount: monthPomodoros,
        pomodoroTimeToday: (today.totalWorkDuration || 0) / 3600,
        avgPomodoroTimePerDay: weekDuration / 7 / 3600,
        tasksCompletedToday: today.pomodoroCount || 0,
        streak,
        avgPomodorosPerDay: (totalPomodoros / 7).toFixed(1),
        avgPomodoroLength,
        completionRate,
        longestFocusSeconds,
        tomato: {
            level: tomatoLevel,
            variety,
            growthStage,
            totalPomodorosAllTime,
            currentLevelMin: levelProgressBase,
            currentLevelMax: levelProgressNext,
            progressWithinLevel,
        },
    };
}

export function computeFocusChartData(analytics, focusPeriod) {
    const now = new Date();
    const lookup = new Map(analytics.map((d) => [d.date, d]));

    if (focusPeriod === 'days') {
        const data = [];
        for (let i = 6; i >= 0; i--) {
            const d = addDays(now, -i);
            const key = formatYMD(d);
            const row = lookup.get(key);
            const minutes = Math.round((row?.totalWorkDuration || 0) / 60);
            data.push({ label: shortDayLabel(key), date: key, minutes, full: key });
        }
        return data;
    }

    if (focusPeriod === 'weeks') {
        const data = [];
        for (let w = 3; w >= 0; w--) {
            const weekStart = addDays(now, -w * 7 - 6);
            const weekEnd = addDays(weekStart, 6);
            const startKey = formatYMD(weekStart);
            const endKey = formatYMD(weekEnd);
            let total = 0;
            analytics.forEach((a) => {
                if (a.date >= startKey && a.date <= endKey) total += a.totalWorkDuration || 0;
            });
            data.push({
                label: `W${4 - w}`,
                date: startKey,
                minutes: Math.round(total / 60),
                full: `${startKey} – ${endKey}`,
            });
        }
        return data;
    }

    if (focusPeriod === 'months') {
        const data = [];
        for (let m = 5; m >= 0; m--) {
            const monthDate = addDays(now, -m * 30);
            const monthKey = shortMonthLabel(formatYMD(monthDate));
            const startKey = formatYMD(addDays(monthDate, -14));
            const endKey = formatYMD(addDays(monthDate, 15));
            let total = 0;
            analytics.forEach((a) => {
                if (a.date >= startKey && a.date <= endKey) total += a.totalWorkDuration || 0;
            });
            data.push({ label: monthKey, date: monthKey, minutes: Math.round(total / 60), full: monthKey });
        }
        return data;
    }

    return [];
}
