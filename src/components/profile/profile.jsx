import React, { useEffect, useState } from "react";
import Header from '/src/components/header/Header.jsx';
import { auth, db } from "/src/firebase.js";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import './profile.css';
import Button from '@mui/material/Button';
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import '/src/components/signUp/signUp.css'
import { getAuth, signOut } from "firebase/auth";


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

export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [weekOffset, setWeekOffset] = useState(0);

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

    const weekStart = React.useMemo(() => {
        const base = startWeek(new Date());
        return addDays(base, weekOffset * 7);
    }, [weekOffset]);

    const weekEnd = React.useMemo(() => addDays(weekStart, 6), [weekStart]);

    const weekData = React.useMemo(() => {
        const startKey = formatYMD(weekStart);
        const endKey = formatYMD(weekEnd);

        const range = analytics.filter(d => d.date >= startKey && d.date <= endKey);
        const lookup = new Map(range.map(d => [d.date, d]));

        const filled = [];
        for (let i = 0; i < 7; i++) {
            const dayKey = formatYMD(addDays(weekStart, i));
            const row = lookup.get(dayKey);

            filled.push({
                date: dayKey,
                totalWorkDuration: row?.totalWorkDuration ?? 0,
                pomodoroCount: row?.pomodoroCount ?? 0,
            });
        }

        return filled;
    }, [analytics, weekStart, weekEnd]);

    if (!user) return null;

    const maxSeconds = Math.max(...weekData.map(item => item.totalWorkDuration), 60);
    const roundedMaxHours = Math.ceil(maxSeconds / 3600);
    const maxY = roundedMaxHours * 3600;
    const ticks = Array.from({ length: roundedMaxHours + 1 }, (_, i) => i * 3600);

    return (
        <div>
            <Header/>
            <div className="profile-container">
                <p>Logged in as: {user.email}</p>

                <h2>Your Weekly Productivity</h2>

                {loading && <p>Loading analytics...</p>}

                {!loading && analytics.length === 0 && (
                    <p>No work sessions logged yet. Start a pomodoro to see your progress here!</p>
                )}

                {!loading && analytics.length > 0 && (

                    <div className="chart-wrapper">
                        <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 12}}>
                            <Button variant="outlined" onClick={() => setWeekOffset(o => o - 1)}>
                                Prev week
                            </Button>

                            <div style={{fontWeight: 600}}>
                                {formatYMD(weekStart)} → {formatYMD(weekEnd)}
                            </div>

                            <Button
                                variant="outlined"
                                onClick={() => setWeekOffset(o => o + 1)}
                                disabled={weekOffset >= 0}
                            >
                                Next week
                            </Button>

                            {weekOffset !== 0 && (
                                <Button onClick={() => setWeekOffset(0)}>
                                    This week
                                </Button>
                            )}
                        </div>

                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weekData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>

                            <CartesianGrid strokeDasharray="2 2"/>
                                <XAxis dataKey="date"/>
                                <YAxis
                                    domain={[0, maxY]}
                                    ticks={ticks}
                                    tickFormatter={(val) => `${val / 3600}h`}
                                />
                                <Tooltip
                                    formatter={(val) => {
                                        if (val > 59 * 60) {
                                            return `${(val / 3600).toFixed(1)} h`;
                                        } else {
                                            return `${(val / 60).toFixed(1)} min`;
                                        }
                                    }}
                                />
                                <Bar dataKey="totalWorkDuration" fill="#3f9e34" name="Work Duration"/>
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="profile-actions">
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate('/create-room')}
                                style={{marginRight: '10px'}}
                            >
                                Create Study Room
                            </Button>
                            <Button onClick={handleLogout}>Logout</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>

    );
    }
