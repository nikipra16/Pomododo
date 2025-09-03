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


export default function Profile() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);

    // useEffect(() => {
    //     const testAnalytics = [
    //         { date: '2025-07-21', totalWorkDuration: 1500, pomodoroCount: 3 },
    //         { date: '2025-07-22', totalWorkDuration: 3600, pomodoroCount: 4 },
    //         { date: '2025-07-23', totalWorkDuration: 2700, pomodoroCount: 2 },
    //         { date: '2025-07-24', totalWorkDuration: 5400, pomodoroCount: 5 },
    //         { date: '2025-07-25', totalWorkDuration: 1800, pomodoroCount: 1 },
    //         { date: '2025-07-26', totalWorkDuration: 4200, pomodoroCount: 3 },
    //         { date: '2025-07-27', totalWorkDuration: 600, pomodoroCount: 1 },
    //     ];
    //     setAnalytics(testAnalytics);
    //     setLoading(false);
    // }, []);

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            navigate("/login");
            return;
        }
        setUser(currentUser);
        console.log("Current user:", auth.currentUser);

        (async function fetchAndSetAnalytics() {
            try {
                const analyticsRef = collection(db, "users", currentUser.uid, "analytics");
                const q = query(analyticsRef, orderBy("__name__", "desc"));
                const snapshot = await getDocs(q);

                if (snapshot.empty) {
                    setAnalytics([]);
                } else {
                    const data = snapshot.docs.map(doc => ({
                        date: doc.id,
                        totalWorkDuration: doc.data().totalWorkDuration || 0,
                        pomodoroCount: doc.data().pomodoroCount || 0,
                    }));
                    // reversed for chronology
                    setAnalytics(data.reverse());
                }
            } catch (error) {
                console.error("Error fetching analytics:", error);
                setAnalytics([]);
            } finally {
                setLoading(false);
            }
        })();
    }, [navigate]);

    if (!user) return null;
    console.log("Analytics data:", analytics);
    console.log("Loading:", loading);

    const handleLogout = () => {
        signOut(auth)
            .then(() => {
                navigate("/login");
            })
    };


    const maxSeconds = Math.max(...analytics.map(item => item.totalWorkDuration), 60);
    const roundedMaxHours = Math.ceil(maxSeconds / 3600);
    const maxY = roundedMaxHours * 3600;
    // so y axis' unit is 1 hour (used chatgpt)
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
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={analytics}
                                margin={{top: 20, right: 30, left: 20, bottom: 5}}
                            >
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
                                style={{ marginRight: '10px' }}
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
