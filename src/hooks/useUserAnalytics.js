import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '/src/firebase.js';

/**
 * Loads Firestore analytics for the signed-in user.
 * Redirects to /login if not authenticated.
 * Subscribes to auth so profile/photo updates show without a full reload.
 */
export function useUserAnalytics() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [analytics, setAnalytics] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            if (!u) {
                navigate('/login');
                setUser(null);
                setAnalytics([]);
                setLoading(false);
                return;
            }

            setUser(u);
            setLoading(true);

            (async function fetchAnalytics() {
                try {
                    const analyticsRef = collection(db, 'users', u.uid, 'analytics');
                    const q = query(analyticsRef, orderBy('__name__', 'desc'));
                    const snapshot = await getDocs(q);
                    const data = snapshot.docs.map((doc) => ({
                        date: doc.id,
                        totalWorkDuration: doc.data().totalWorkDuration || 0,
                        pomodoroCount: doc.data().pomodoroCount || 0,
                    }));
                    setAnalytics(data.reverse());
                } catch {
                    setAnalytics([]);
                } finally {
                    setLoading(false);
                }
            })();
        });

        return () => unsub();
    }, [navigate]);

    return { user, analytics, loading };
}
