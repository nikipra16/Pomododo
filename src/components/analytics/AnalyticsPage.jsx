import React, { useMemo, useState } from 'react';
import Header from '/src/components/header/Header.jsx';
import { LineChart, Line, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import { useUserAnalytics } from '/src/hooks/useUserAnalytics.js';
import { computeDashboardStats, computeFocusChartData } from '/src/utils/analyticsDashboard.js';
import '/src/components/profile/profile.css';

export default function AnalyticsPage() {
    const { user, analytics, loading } = useUserAnalytics();
    const [focusPeriod, setFocusPeriod] = useState('days');

    const stats = useMemo(() => computeDashboardStats(analytics), [analytics]);
    const focusChartData = useMemo(
        () => computeFocusChartData(analytics, focusPeriod),
        [analytics, focusPeriod]
    );

    if (!user) return null;

    return (
        <div>
            <Header />
            <div className="profile-container profile-container--analytics">
                {loading && (
                    <div className="profile-card profile-card--solo">
                        <p>Loading analytics...</p>
                    </div>
                )}

                {!loading && analytics.length === 0 && (
                    <div className="profile-card profile-card--solo">
                        <p>No work sessions logged yet. Start a pomodoro to see your progress here!</p>
                    </div>
                )}

                {!loading && analytics.length > 0 && (
                    <div className="analytics-page-stack">
                        <div className="profile-card profile-card--welcome">
                            <section className="tomato-section">
                                <div className="tomato-header">
                                    <div>
                                        <h2 className="tomato-welcome">Your progress</h2>
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
                                        )}{' '}
                                        to next level
                                    </span>
                                </div>
                            </section>
                        </div>

                        <div className="profile-card profile-card--analytics">
                            <section className="analytics-section">
                                <header className="analytics-header">
                                    <h3 className="analytics-title">Analytics</h3>
                                </header>

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
                                        <span className="stat-label">Average focus time / day</span>
                                    </div>
                                    <div className="stat-card">
                                        <span className="stat-value">{stats.tasksCompletedToday}</span>
                                        <span className="stat-label">Sessions today</span>
                                    </div>
                                </div>

                                <div className="focus-hours-section">
                                    <div className="focus-hours-header">
                                        <h4 className="focus-hours-title">Focus over time</h4>
                                        <div className="period-selector" role="tablist" aria-label="Chart time range">
                                            <button
                                                type="button"
                                                className={focusPeriod === 'days' ? 'period-btn active' : 'period-btn'}
                                                onClick={() => setFocusPeriod('days')}
                                            >
                                                Days
                                            </button>
                                            <button
                                                type="button"
                                                className={focusPeriod === 'weeks' ? 'period-btn active' : 'period-btn'}
                                                onClick={() => setFocusPeriod('weeks')}
                                            >
                                                Weeks
                                            </button>
                                            <button
                                                type="button"
                                                className={
                                                    focusPeriod === 'months' ? 'period-btn active' : 'period-btn'
                                                }
                                                onClick={() => setFocusPeriod('months')}
                                            >
                                                Months
                                            </button>
                                        </div>
                                    </div>
                                    <div className="focus-chart-wrapper">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart
                                                data={focusChartData}
                                                margin={{ top: 16, right: 24, left: 0, bottom: 28 }}
                                                isAnimationActive
                                                animationDuration={400}
                                            >
                                                <CartesianGrid strokeDasharray="3 6" stroke="#e5e7eb" vertical={false} />
                                                <XAxis dataKey="label" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                                <YAxis
                                                    tickFormatter={(v) => `${v}m`}
                                                    tick={{ fontSize: 12 }}
                                                    width={32}
                                                    axisLine={false}
                                                    tickLine={false}
                                                />
                                                <Tooltip
                                                    formatter={(val) => [`${val} min`, 'Focus']}
                                                    labelFormatter={(_, payload) => payload[0]?.payload?.full ?? ''}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="minutes"
                                                    stroke="transparent"
                                                    fill="rgba(194, 79, 79, 0.12)"
                                                />
                                                <Line
                                                    type="monotone"
                                                    dataKey="minutes"
                                                    stroke="#c24f4f"
                                                    strokeWidth={2}
                                                    dot={{ fill: '#c24f4f', r: 3 }}
                                                    activeDot={{ r: 4 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>

                                <div className="stat-cards-grid stat-cards-grid--bottom">
                                    <div className="stat-card">
                                        <span className="stat-value">{stats.streak}</span>
                                        <span className="stat-label">Day streak</span>
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
                                        <span className="stat-label">Longest focus (single day)</span>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
