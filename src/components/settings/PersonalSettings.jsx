import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '/src/firebase.js';
import SettingsLayout from '/src/components/settings/SettingsLayout.jsx';
import { onAuthStateChanged, updateProfile, reload } from 'firebase/auth';
import './settings.css';

export default function PersonalSettings() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [displayName, setDisplayName] = useState('');
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [profileSuccess, setProfileSuccess] = useState('');

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            if (!u) navigate('/login');
            else {
                setUser(u);
                setDisplayName(u.displayName?.trim() ?? '');
            }
        });
        return () => unsub();
    }, [navigate]);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setProfileError('');
        setProfileSuccess('');

        const u = auth.currentUser;
        if (!u) {
            setProfileError('Not signed in.');
            return;
        }

        const trimmed = displayName.trim();
        if (trimmed.length > 80) {
            setProfileError('Name must be 80 characters or fewer.');
            return;
        }

        setProfileSaving(true);
        try {
            await updateProfile(u, { displayName: trimmed });
            await reload(u);
            setUser(auth.currentUser);
            setDisplayName(auth.currentUser?.displayName?.trim() ?? '');
            setProfileSuccess('Profile updated.');
        } catch {
            setProfileError('Could not update profile. Try again.');
        } finally {
            setProfileSaving(false);
        }
    };

    if (!user) return null;

    return (
        <SettingsLayout title="Personal">
            <div className="settings-page-card profile-card--settings">
                <div className="settings-group">
                    <div className="settings-form-block">
                        <form className="settings-form" onSubmit={handleSaveProfile} noValidate>
                            <div className="settings-field">
                                <label className="settings-field-label" htmlFor="personal-display-name">
                                    Display name
                                </label>
                                <input
                                    id="personal-display-name"
                                    className="settings-input"
                                    type="text"
                                    autoComplete="name"
                                    maxLength={80}
                                    value={displayName}
                                    onChange={(ev) => setDisplayName(ev.target.value)}
                                />
                            </div>
                            {profileError ? (
                                <p className="settings-message settings-message--error" role="alert">
                                    {profileError}
                                </p>
                            ) : null}
                            {profileSuccess ? (
                                <p className="settings-message settings-message--success" role="status">
                                    {profileSuccess}
                                </p>
                            ) : null}
                            <div className="settings-form-actions">
                                <button type="submit" className="settings-form-btn" disabled={profileSaving}>
                                    {profileSaving ? 'Saving…' : 'Save profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </SettingsLayout>
    );
}
