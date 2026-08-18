import { Suspense, lazy } from 'react';
import './App.css';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/header/Header.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import ToDo from './components/todo/todo.jsx';
import { AppProvider } from './components/AppContext.jsx';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import {PomodoroTimer} from "./components/pomodoro/pomodoroTimer.jsx";

// Lazy load routes for code splitting and better caching
const SignUp = lazy(() => import("./components/signUp/signUp.jsx"));
const LogIn = lazy(() => import('./components/login/login.jsx'));
const Profile = lazy(() => import('./components/profile/profile.jsx'));
const AnalyticsPage = lazy(() => import('./components/analytics/AnalyticsPage.jsx'));
const PersonalSettings = lazy(() => import('./components/settings/PersonalSettings.jsx'));
const PreferencesSettings = lazy(() => import('./components/settings/PreferencesSettings.jsx'));
const AccountSettings = lazy(() => import('./components/settings/AccountSettings.jsx'));
const AccessibilitySettings = lazy(() => import('./components/settings/AccessibilitySettings.jsx'));

// Loading fallback component
const LoadingFallback = () => (
    <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        fontFamily: 'Poppins, sans-serif'
    }}>
        <div>Loading...</div>
    </div>
);

function App() {

    return (
        <div className="mainWrapper">
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <div className={'mainContainer'} >
                <Header />
                <main id="main-content" className="contentWrapper">
                    <PomodoroTimer />
                    <div className="ToDo-container">
                        <ToDo />
                    </div>
                </main>

            </div>
        </div>
    );
}

export default function AppWrapper() {
    return (
        <AppProvider>
            <Router>
                <Suspense fallback={<LoadingFallback />}>
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/login" element={<LogIn />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/settings/personal" element={<PersonalSettings />} />
                    <Route path="/settings/preferences" element={<PreferencesSettings />} />
                    <Route path="/settings/account" element={<AccountSettings />} />
                    <Route path="/settings/accessibility" element={<AccessibilitySettings />} />
                </Routes>
                </Suspense>
            </Router>
        </AppProvider>
    );
}