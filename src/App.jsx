import { useState, useEffect, useRef,} from 'react';
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
import SignUp from "./components/signUp/signUp.jsx";
import LogIn from './components/login/login.jsx';
import Profile from './components/profile/profile.jsx';
import CreateRoom from './components/studyRoom/CreateRoom.jsx';
import StudyRoom from './components/studyRoom/StudyRoom.jsx';
import {PomodoroTimer} from "./components/pomodoro/pomodoroTimer.jsx";

function App() {

    return (
        <div className="mainWrapper">
            <a href="#main-content" className="skip-link">Skip to main content</a>
            <div className={'mainContainer'} >
                <Header />
                <div id="main-content" className="contentWrapper" tabIndex="-1">
                    <PomodoroTimer />
                    <div className="ToDo-container">
                        <ToDo />
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function AppWrapper() {
    return (
        <AppProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/login" element={<LogIn />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/create-room" element={<CreateRoom />} />
                    <Route path="/room/:roomCode" element={<StudyRoom />} />
                </Routes>
            </Router>
        </AppProvider>
    );
}