import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Header from '/src/components/header/Header.jsx';
import './profile.css';
import 'bootstrap/dist/css/bootstrap-grid.min.css';
import '/src/components/signUp/signUp.css';
import { useUserAnalytics } from '/src/hooks/useUserAnalytics.js';
import { computeDashboardStats } from '/src/utils/analyticsDashboard.js';

function formatJoined(isoString) {
    if (!isoString) return '—';
    try {
        return new Date(isoString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    } catch {
        return '—';
    }
}

function getInitials(displayName, email) {
    const name = displayName?.trim();
    if (name && name !== '—') {
        const parts = name.split(/\s+/).filter(Boolean);
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    }
    if (email) {
        const local = (email.split('@')[0] || '').replace(/[^a-zA-Z0-9]/g, '');
        if (local.length >= 2) return local.slice(0, 2).toUpperCase();
        if (local.length === 1) return `${local}${local}`.toUpperCase();
    }
    return '?';
}

function greetingName(displayName) {
    const name = displayName?.trim();
    if (!name || name === '—') return 'there';
    return name.split(/\s+/)[0];
}

export default function Profile() {
    const { user, analytics, loading } = useUserAnalytics();
    const stats = useMemo(() => computeDashboardStats(analytics), [analytics]);

    if (!user) {
        if (loading) {
            return (
                <div className="profile-page-wrap">
                    <Header />
                    <div className="profile-container profile-container--profile profile-page--cute">
                        <div className="profile-card profile-card--solo profile-card--cute profile-card--cute-loading">
                            <p className="profile-cute-loading-text">Gathering your profile…</p>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    }

    const displayName = user.displayName?.trim() || '—';
    const initials = getInitials(displayName, user.email);
    const hiName = greetingName(displayName);

    return (
        <div className="profile-page-wrap">
            <Header />
            <div className="profile-container profile-container--profile profile-page--cute">
                {loading && (
                    <div className="profile-card profile-card--solo profile-card--cute profile-card--cute-loading">
                        <p className="profile-cute-loading-text">Gathering your profile…</p>
                    </div>
                )}

                {!loading && (
                    <div className="profile-card profile-card--solo profile-card--identity profile-card--cute">
                        <header className="profile-cute-hero">
                            <div className="profile-cute-avatar" aria-hidden="true">
                                {initials}
                            </div>
                            <div className="profile-cute-hero-text">
                                <h1 className="profile-page-title profile-page-title--cute">
                                    Hi, {hiName}!
                                </h1>
                                <p className="profile-cute-tagline">Your profile details</p>
                                <div className="profile-cute-actions">
                                    <Link className="profile-edit-profile-link" to="/settings/personal">
                                        {displayName === '—' ? 'Add profile' : 'Edit profile'}
                                    </Link>
                                </div>
                            </div>
                        </header>

                        <dl className="profile-identity profile-identity--cute">
                            <div className="profile-identity-row profile-identity-row--cute">
                                <dt>Name</dt>
                                <dd>{displayName}</dd>
                            </div>
                            <div className="profile-identity-row profile-identity-row--cute">
                                <dt>Email</dt>
                                <dd>{user.email}</dd>
                            </div>
                            <div className="profile-identity-row profile-identity-row--cute">
                                <dt>Member since</dt>
                                <dd>{formatJoined(user.metadata?.creationTime)}</dd>
                            </div>
                            <div className="profile-identity-row profile-identity-row--cute profile-identity-row--streak">
                                <dt>Streak</dt>
                                <dd>
                                    <span className="profile-cute-streak-pill">
                                        {stats.streak === 0
                                            ? 'Start your streak today!'
                                            : `${stats.streak} day${stats.streak === 1 ? '' : 's'} strong`}
                                    </span>
                                </dd>
                            </div>
                        </dl>
                    </div>
                )}
            </div>
        </div>
    );
}
