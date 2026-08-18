import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '/src/firebase.js';
import SettingsLayout from '/src/components/settings/SettingsLayout.jsx';
import { onAuthStateChanged } from 'firebase/auth';
import './settings.css';

export default function PreferencesSettings() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            if (!u) navigate('/login');
            else setUser(u);
        });
        return () => unsub();
    }, [navigate]);

    const handleNotificationPermission = async () => {
        if (!('Notification' in window)) {
            window.alert('This browser does not support notifications.');
            return;
        }
        await Notification.requestPermission();
    };

    if (!user) return null;

    return (
        <SettingsLayout title="Preferences">
            <div className="settings-page-card profile-card--settings">
                <div className="settings-group">
                    <ul className="settings-list" role="list" aria-label="App preferences">
                        <li className="settings-row">
                            <span className="settings-row-label">Notifications</span>
                            <button
                                type="button"
                                className="settings-row-btn settings-row-btn--primary"
                                onClick={handleNotificationPermission}
                            >
                                Enable
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </SettingsLayout>
    );
}
