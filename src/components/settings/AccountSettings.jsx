import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '/src/firebase.js';
import SettingsLayout from '/src/components/settings/SettingsLayout.jsx';
import {
    signOut,
    onAuthStateChanged,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider,
} from 'firebase/auth';
import './settings.css';

function passwordProviderErrorMessage(code) {
    switch (code) {
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'Current password is incorrect.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/requires-recent-login':
            return 'Please enter your current password again, then try updating.';
        default:
            return 'Could not update password. Try again.';
    }
}

export default function AccountSettings() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    const hasPasswordProvider = useMemo(
        () => user?.providerData?.some((p) => p.providerId === 'password') ?? false,
        [user]
    );

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            if (!u) navigate('/login');
            else setUser(u);
        });
        return () => unsub();
    }, [navigate]);

    const handleLogout = () => {
        signOut(auth).then(() => navigate('/login'));
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (!newPassword || newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError('New password and confirmation do not match.');
            return;
        }
        if (!currentPassword) {
            setPasswordError('Enter your current password.');
            return;
        }

        const u = auth.currentUser;
        if (!u || !u.email) {
            setPasswordError('No signed-in user.');
            return;
        }

        setPasswordSaving(true);
        try {
            const credential = EmailAuthProvider.credential(u.email, currentPassword);
            await reauthenticateWithCredential(u, credential);
            await updatePassword(u, newPassword);
            setPasswordSuccess('Password updated.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setPasswordError(passwordProviderErrorMessage(err?.code));
        } finally {
            setPasswordSaving(false);
        }
    };

    if (!user) return null;

    return (
        <SettingsLayout title="Account">
            <div className="settings-page-card profile-card--settings">
                <div className="settings-group">
                    <ul className="settings-list" role="list" aria-label="Account settings">
                            <li className="settings-row settings-row--static">
                                <span className="settings-row-label">Email</span>
                                <span className="settings-row-value">{user.email}</span>
                            </li>
                            <li className="settings-row settings-row--action">
                                <button type="button" className="settings-row-logout" onClick={handleLogout}>
                                    <span>Log out</span>
                                    <span className="settings-row-chevron" aria-hidden>
                                        ›
                                    </span>
                                </button>
                            </li>
                    </ul>

                    {hasPasswordProvider ? (
                        <div className="settings-form-block">
                            <h2 className="settings-form-title">Change password</h2>
                            <form className="settings-form" onSubmit={handleChangePassword} noValidate>
                                <div className="settings-field">
                                    <label className="settings-field-label" htmlFor="account-current-password">
                                        Current password
                                    </label>
                                    <input
                                        id="account-current-password"
                                        className="settings-input"
                                        type="password"
                                        autoComplete="current-password"
                                        value={currentPassword}
                                        onChange={(ev) => setCurrentPassword(ev.target.value)}
                                    />
                                </div>
                                <div className="settings-field">
                                    <label className="settings-field-label" htmlFor="account-new-password">
                                        New password
                                    </label>
                                    <input
                                        id="account-new-password"
                                        className="settings-input"
                                        type="password"
                                        autoComplete="new-password"
                                        value={newPassword}
                                        onChange={(ev) => setNewPassword(ev.target.value)}
                                    />
                                </div>
                                <div className="settings-field">
                                    <label className="settings-field-label" htmlFor="account-confirm-password">
                                        Confirm new password
                                    </label>
                                    <input
                                        id="account-confirm-password"
                                        className="settings-input"
                                        type="password"
                                        autoComplete="new-password"
                                        value={confirmPassword}
                                        onChange={(ev) => setConfirmPassword(ev.target.value)}
                                    />
                                </div>
                                {passwordError ? (
                                    <p className="settings-message settings-message--error" role="alert">
                                        {passwordError}
                                    </p>
                                ) : null}
                                {passwordSuccess ? (
                                    <p className="settings-message settings-message--success" role="status">
                                        {passwordSuccess}
                                    </p>
                                ) : null}
                                <div className="settings-form-actions">
                                    <button
                                        type="submit"
                                        className="settings-form-btn"
                                        disabled={passwordSaving}
                                    >
                                        {passwordSaving ? 'Updating…' : 'Update password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div className="settings-form-block">
                            <h2 className="settings-form-title">Password</h2>
                            <p className="settings-hint">
                                This account uses a social or other sign-in method. There is no password to change here.
                                Use your provider (e.g. Google) to manage account security, or add email & password
                                sign-in from Firebase if you need it.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </SettingsLayout>
    );
}
