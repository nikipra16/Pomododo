import React, { useEffect, useState, useMemo } from "react";
import Header from '/src/components/header/Header.jsx';
import { auth, db } from "/src/firebase.js";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { LineChart, Line, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import './profile.css';
import Button from '@mui/material/Button';
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import '/src/components/signUp/signUp.css';
import { signOut } from "firebase/auth";


//chatgpt
function formatYMD(dateObj) {
    const y = dateObj.getFullYear();
    const m = String(dateObj.getMonth() + 1).padStart(2, "0");
    const d = String(dateObj.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

function startWeek(date) {
    const d = new Date(date);
    d.setHours(0,0,0,0)
    const day = (d.getDay() + 6) % 7;
    d.setDate(d.getDate() - day);
    return d;
}

function addDays(dateObj, n) {
    const d = new Date(dateObj);
    d.setDate(d.getDate() + n);
    return d;
}

function shortDayLabel(dateKey) {
    const d = new Date(dateKey + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short' });
}

function shortMonthLabel(dateKey) {
    return dateKey.slice(0, 7); // YYYY-MM
}

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [focusPeriod, setFocusPeriod] = useState('days'); // 'days' | 'weeks' | 'months'

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            navigate("/login");
            return;
        }
        setUser(currentUser);

        (async function fetchAndSetAnalytics() {
            try {
                const analyticsRef = collection(db, "users", currentUser.uid, "analytics");
                const q = query(analyticsRef, orderBy("__name__", "desc"));
                const snapshot = await getDocs(q);

                const data = snapshot.docs.map(doc => ({
                    date: doc.id,
                    totalWorkDuration: doc.data().totalWorkDuration || 0,
                    pomodoroCount: doc.data().pomodoroCount || 0,
                }));

                setAnalytics(data.reverse());
            } catch (e) {
                setAnalytics([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [navigate]);

    const handleLogout = () => {
        signOut(auth).then(() => navigate("/login"));
    };

    const todayKey = useMemo(() => formatYMD(new Date()), []);

    const stats = useMemo(() => {
        const today = analytics.find(d => d.date === todayKey) || { totalWorkDuration: 0, pomodoroCount: 0 };
        const now = new Date();
        const weekStartKey = formatYMD(addDays(now, -6));
        const monthStartKey = formatYMD(addDays(now, -30));
        const weekRange = analytics.filter(d => d.date >= weekStartKey && d.date <= todayKey);
        const monthRange = analytics.filter(d => d.date >= monthStartKey && d.date <= todayKey);

        const totalPomodorosAllTime = analytics.reduce(
            (s, d) => s + (d.pomodoroCount || 0),
            0
        );

        const weekPomodoros = weekRange.reduce((s, d) => s + (d.pomodoroCount || 0), 0);
        const weekDuration = weekRange.reduce((s, d) => s + (d.totalWorkDuration || 0), 0);
        const monthPomodoros = monthRange.reduce((s, d) => s + (d.pomodoroCount || 0), 0);

        const longestFocusSeconds = analytics.reduce(
            (max, d) => Math.max(max, d.totalWorkDuration || 0),
            0
        );

        let streak = 0;
        for (let i = 0; i < 365; i++) {
            const d = formatYMD(addDays(now, -i));
            const row = analytics.find(a => a.date === d);
            if (row && (row.pomodoroCount > 0 || row.totalWorkDuration > 0)) streak++;
            else break;
        }

        const totalPomodoros = weekRange.reduce((s, d) => s + (d.pomodoroCount || 0), 0);
        const avgPomodoroLength = totalPomodoros > 0
            ? Math.round(weekRange.reduce((s, d) => s + (d.totalWorkDuration || 0), 0) / totalPomodoros / 60)
            : 0;
        const completionRate = weekRange.length > 0 ? Math.round((weekRange.filter(d => (d.pomodoroCount || 0) > 0).length / 7) * 100) : 0;

        // Tomato garden leveling
        const POMS_PER_LEVEL = 20;
        const tomatoLevel = totalPomodorosAllTime === 0
            ? 0
            : Math.floor((totalPomodorosAllTime - 1) / POMS_PER_LEVEL) + 1;
        const levelProgressBase = Math.floor(totalPomodorosAllTime / POMS_PER_LEVEL) * POMS_PER_LEVEL;
        const levelProgressNext = levelProgressBase + POMS_PER_LEVEL;
        const progressWithinLevel = Math.min(
            1,
            (totalPomodorosAllTime - levelProgressBase) / POMS_PER_LEVEL
        );

        let variety = "Cherry Tomato";
        if (tomatoLevel >= 4 && tomatoLevel <= 6) variety = "Roma Tomato";
        else if (tomatoLevel >= 7 && tomatoLevel <= 9) variety = "Heirloom Tomato";
        else if (tomatoLevel >= 10) variety = "Beefsteak Tomato";

        let growthStage = "Seed";
        if (weekPomodoros >= 1 && weekPomodoros <= 2) growthStage = "Sprout";
        else if (weekPomodoros >= 3 && weekPomodoros <= 4) growthStage = "Flowering";
        else if (weekPomodoros >= 5 && weekPomodoros <= 6) growthStage = "Green fruit";
        else if (weekPomodoros >= 7) growthStage = "Ripe tomato";

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
            breaksToday: 0,
            breakTimeToday: 0,
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
    }, [analytics, todayKey]);

    const focusChartData = useMemo(() => {
        const now = new Date();
        const lookup = new Map(analytics.map(d => [d.date, d]));

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
                analytics.forEach(a => {
                    if (a.date >= startKey && a.date <= endKey) total += a.totalWorkDuration || 0;
                });
                data.push({ label: `W${4 - w}`, date: startKey, minutes: Math.round(total / 60), full: `${startKey} – ${endKey}` });
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
                analytics.forEach(a => {
                    if (a.date >= startKey && a.date <= endKey) total += a.totalWorkDuration || 0;
                });
                data.push({ label: monthKey, date: monthKey, minutes: Math.round(total / 60), full: monthKey });
            }
            return data;
        }

        return [];
    }, [analytics, focusPeriod]);

    if (!user) return null;

    return (
        <div>
            <Header/>
            <div className="profile-container">
                <div className="profile-card">
                    {loading && <p>Loading analytics...</p>}

                    {!loading && analytics.length === 0 && (
                        <p>No work sessions logged yet. Start a pomodoro to see your progress here!</p>
                    )}

                    {!loading && analytics.length > 0 && (
                        <>
                            <section className="tomato-section">
                                <div className="tomato-header">
                                    <div>
                                        <h2 className="tomato-welcome">Welcome back</h2>
                                        <p className="tomato-email">{user.email}</p>
                                    </div>
                                    <span className="tomato-variety">{stats.tomato.variety}</span>
                                </div>
                                <p className="tomato-subtitle">
                                    Level {stats.tomato.level || 0} · {stats.tomato.growthStage}
                                </p>
                                <div className="tomato-progress-bar">
                                    <div
                                        className="tomato-progress-fill"
                                        style={{ width: `${stats.tomato.progressWithinLevel * 100}%` }}
                                    />
                                </div>
                                <div className="tomato-progress-labels">
                                    <span>{stats.tomato.totalPomodorosAllTime} pomodoros completed</span>
                                    <span>
                                        {Math.max(
                                            0,
                                            stats.tomato.currentLevelMax - stats.tomato.totalPomodorosAllTime
                                        )}{" "}
                                        to next level
                                    </span>
                                </div>
                            </section>

                            <section className="analytics-section">
                                <h3 className="analytics-title">Analytics</h3>

                                <div className="stat-cards-grid">
                                    <div className="stat-card">
                                        <span className="stat-value">{stats.todayCount}</span>
                                        <span className="stat-label">Pomodoros today</span>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-value">
                                            {stats.avgPomodoroTimePerDay >= 1
                                                ? `${stats.avgPomodoroTimePerDay.toFixed(1)}h`
                                                : `${Math.round(stats.avgPomodoroTimePerDay * 60)}m`}
                                        </span>
                                        <span className="stat-label">Average focus time/day</span>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-value">{stats.tasksCompletedToday}</span>
                                        <span className="stat-label">Tasks completed today</span>
                                    </div>
                                </div>

                                <div className="focus-hours-section">
                                    <div className="focus-hours-header">
                                        <h4 className="focus-hours-title">Focus Hours</h4>
                                        <div className="period-selector">
                                            <button type="button" className={focusPeriod === 'days' ? 'period-btn active' : 'period-btn'} onClick={() => setFocusPeriod('days')}>Days</button>
                                            <button type="button" className={focusPeriod === 'weeks' ? 'period-btn active' : 'period-btn'} onClick={() => setFocusPeriod('weeks')}>Weeks</button>
                                            <button type="button" className={focusPeriod === 'months' ? 'period-btn active' : 'period-btn'} onClick={() => setFocusPeriod('months')}>Months</button>
                                        </div>
                                    </div>
                                    <div className="focus-chart-wrapper">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={focusChartData} margin={{ top: 16, right: 24, left: 0, bottom: 28 }}>
                                                <defs>
                                                    <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="0%" stopColor="rgba(194, 79, 79, 0.45)" />
                                                        <stop offset="100%" stopColor="rgba(194, 79, 79, 0.06)" />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="2 2" stroke="#eee" vertical={false} />
                                                <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                                <YAxis tickFormatter={(v) => `${v}m`} tick={{ fontSize: 12 }} width={32} axisLine={false} tickLine={false} />
                                                <Tooltip formatter={(val) => [`${val} min`, 'Focus']} labelFormatter={(_, payload) => payload[0]?.payload?.full ?? ''} />
                                                <Area type="monotone" dataKey="minutes" stroke="transparent" fill="url(#focusGradient)" />
                                                <Line type="monotone" dataKey="minutes" stroke="#c24f4f" strokeWidth={2} dot={{ fill: '#c24f4f', r: 3 }} activeDot={{ r: 4 }} />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="stat-cards-grid">
                                    <div className="stat-card">
                                        <span className="stat-value">{stats.streak}</span>
                                        <span className="stat-label">Pomodoro streak</span>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-value">{stats.avgPomodoroLength}m</span>
                                        <span className="stat-label">Average pomodoro length</span>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-value">
                                            {stats.longestFocusSeconds >= 3600
                                                ? `${(stats.longestFocusSeconds / 3600).toFixed(1)}h`
                                                : `${Math.round(stats.longestFocusSeconds / 60)}m`}
                                        </span>
                                        <span className="stat-label">Longest focus time (day)</span>
                                    </div>
                                </div>
                            </section>

                            <div className="profile-actions">
                                <Button variant="contained" color="primary" onClick={() => navigate('/create-room')}>
                                    Create Study Room
                                </Button>
                                <Button variant="outlined" onClick={handleLogout}>Logout</Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>

    );
    }
