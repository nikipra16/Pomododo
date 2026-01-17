import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import './App.css';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, IconButton, ThemeProvider} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import Header from './components/header/Header.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Slider, Typography } from '@mui/material';
import { LinearProgress } from '@mui/material';
import ToDo from './components/todo/todo.jsx';
import theme from './components/theme.jsx';
import { AppProvider, useAppContext } from './components/AppContext.jsx';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import {PomodoroTimer} from "./components/pomodoro/pomodoroTimer.jsx";

// Lazy load routes for code splitting and better caching
const SignUp = lazy(() => import("./components/signUp/signUp.jsx"));
const LogIn = lazy(() => import('./components/login/login.jsx'));
const Profile = lazy(() => import('./components/profile/profile.jsx'));
const CreateRoom = lazy(() => import('./components/studyRoom/CreateRoom.jsx'));
const StudyRoom = lazy(() => import('./components/studyRoom/StudyRoom.jsx'));

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
                    <Route path="/create-room" element={<CreateRoom />} />
                    <Route path="/room/:roomCode" element={<StudyRoom />} />
                </Routes>
                </Suspense>
            </Router>
        </AppProvider>
    );
}