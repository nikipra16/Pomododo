import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '/src/firebase.js';
import { onAuthStateChanged } from 'firebase/auth';
import SettingsLayout from '/src/components/settings/SettingsLayout.jsx';
import './settings.css';

export default function AccessibilitySettings() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [reduceMotion, setReduceMotion] = useState(() => {
        try {
            return localStorage.getItem('pomododoReduceMotion') === '1';
        } catch {
            return false;
        }
    });

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            if (!u) navigate('/login');
            else setUser(u);
        });
        return () => unsub();
    }, [navigate]);

    useEffect(() => {
        const root = document.documentElement;
        if (reduceMotion) {
            root.classList.add('reduce-motion');
            try {
                localStorage.setItem('pomododoReduceMotion', '1');
            } catch {
                /* ignore */
            }
        } else {
            root.classList.remove('reduce-motion');
            try {
                localStorage.setItem('pomododoReduceMotion', '0');
            } catch {
                /* ignore */
            }
        }
    }, [reduceMotion]);

    if (!user) return null;

    return (
        <SettingsLayout title="Accessibility">
            <div className="settings-page-card profile-card--settings">
                <div className="settings-group">
                    <ul className="settings-list" role="list" aria-label="Accessibility settings">
                        <li className="settings-row">
                            <span className="settings-row-label">Reduce motion</span>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={reduceMotion}
                                className={
                                    reduceMotion
                                        ? 'settings-row-btn settings-row-btn--primary'
                                        : 'settings-row-btn'
                                }
                                onClick={() => setReduceMotion((v) => !v)}
                            >
                                {reduceMotion ? 'On' : 'Off'}
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </SettingsLayout>
    );
}
