import { NavLink } from 'react-router-dom';
import Header from '/src/components/header/Header.jsx';
import './settings.css';

const SETTINGS_SECTIONS = [
    { to: '/settings/personal', label: 'Personal' },
    { to: '/settings/preferences', label: 'Preferences' },
    { to: '/settings/account', label: 'Account' },
    { to: '/settings/accessibility', label: 'Accessibility' },
];

/**
 * Shared shell: header + left nav between all settings routes.
 */
export default function SettingsLayout({ title, children }) {
    return (
        <div className="settings-root">
            <Header />
            <div className="settings-layout">
                <aside className="settings-sidebar">
                    <p className="settings-sidebar-heading" id="settings-sidebar-label">
                        Settings
                    </p>
                    <nav aria-labelledby="settings-sidebar-label">
                        <ul className="settings-sidebar-list">
                            {SETTINGS_SECTIONS.map(({ to, label }) => (
                                <li key={to}>
                                    <NavLink
                                        to={to}
                                        className={({ isActive }) =>
                                            `settings-sidebar-link${isActive ? ' settings-sidebar-link--active' : ''}`
                                        }
                                    >
                                        {label}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>
                <main id="main-content" className="settings-layout-main" tabIndex={-1}>
                    <h1 className="settings-page-title">{title}</h1>
                    {children}
                </main>
            </div>
        </div>
    );
}
