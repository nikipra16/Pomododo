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
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SignUp from "./components/signUp/signUp.jsx";
import LogIn from './components/login/login.jsx';
import Profile from './components/profile/profile.jsx';
import {PomodoroTimer} from "./components/pomodoro/pomodoroTimer.jsx";

function App() {

    return (
        <div className="mainWrapper">
            <div className={'mainContainer'} >
                <Header />
                <div className="contentWrapper">
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
            <Router basename="/Pomododo">
                <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/login" element={<LogIn />} />
                    <Route path="/profile" element={<Profile />} />
                </Routes>
            </Router>
        </AppProvider>
    );
}