import { useState, useEffect, useRef,} from 'react';
import '/src/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, IconButton, ThemeProvider} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
// import Header from 'src/components/header/Header.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Slider, Typography } from '@mui/material';
import { LinearProgress } from '@mui/material';
// import ToDo from 'src/components/todo/todo.jsx';
import theme from '/src/components/theme.jsx';
import { useAppContext } from '/src/components/AppContext.jsx';
import { updateAnalytics } from '/src/analytics.js';
import { auth } from '/src/firebase.js';
import './pomodoroTimer.css'

export function PomodoroTimer() {
    const [workMinutes, setWorkMinutes] = useState(25);
    const [breakMinutes, setBreakMinutes] = useState(5);
    const [duration, setDuration] = useState(workMinutes * 60);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const { hasStarted, setHasStarted } = useAppContext();

    const intervalRef = useRef(null);
    const startTime = useRef(0);
    const elapsedRef = useRef(0);
    const sessionDur = () => (isBreak ? breakMinutes : workMinutes) * 60 * 1000;


    useEffect(() => {
        localStorage.setItem('workMinutes', workMinutes);
        localStorage.setItem('hasStarted', hasStarted);
        localStorage.setItem('breakMinutes', breakMinutes);
        localStorage.setItem('duration', duration);
        localStorage.setItem('isActive', isActive.toString());
        localStorage.setItem('isBreak', isBreak.toString());
    }, [workMinutes, breakMinutes, duration, isActive, isBreak, hasStarted]);

    const workOver = new Audio('/Pomododo/sounds/workOver.wav')
    const breakOver = new Audio('/Pomododo/sounds/breakOver.wav')

    useEffect(() => {
        if (isActive) {
            startTime.current = Date.now() - elapsedRef.current;

            intervalRef.current = setInterval(() => {
                const curr = Date.now();
                const elapsed = curr - startTime.current;
                const remaining = sessionDur() - elapsed;

                setDuration(Math.max(Math.floor(remaining / 1000), 0));

                if (remaining <= 0) {
                    clearInterval(intervalRef.current);
                    elapsedRef.current = 0;

                    if (!isBreak) {
                        workOver.play();
                        const user = auth.currentUser;
                        if (user) {
                            updateAnalytics(user.uid, workMinutes * 60).catch(console.error);
                        }
                        setIsBreak(true);
                        setDuration(breakMinutes * 60);
                        setIsActive(true);
                        startTime.current = Date.now();
                    } else {
                        breakOver.play();
                        setIsBreak(false);
                        setIsActive(false);
                        setHasStarted(false);
                        setDuration(workMinutes * 60);
                    }
                }
            }, 100);

            return () => clearInterval(intervalRef.current);
        }
    }, [isActive, isBreak, workMinutes, breakMinutes]);

    useEffect(() => {
        if (!hasStarted) {
            setDuration(workMinutes * 60);
        }
    }, [workMinutes, hasStarted,breakMinutes]);

    const handleStart = () => {
        if (!hasStarted) {
            setDuration(isBreak ? breakMinutes * 60 : workMinutes * 60);
            elapsedRef.current = 0;
        }
        setHasStarted(true);
        setIsActive(true);
    };

    const handlePause = () => {
        setIsActive(false);
        elapsedRef.current = Date.now() - startTime.current;
    };

    const handleReset = () => {
        setIsActive(false);
        setIsBreak(false);
        setHasStarted(false);
        setWorkMinutes(25);
        setBreakMinutes(5);
        setDuration(25 * 60);
        elapsedRef.current = 0;
    };

    useEffect(() => {
        if (process.env.NODE_ENV === "development") {
            window.setIsBreak = setIsBreak;
            window.setDuration = setDuration;
        }
    }, []);

    const progress = (duration / (isBreak ? breakMinutes * 60 : workMinutes * 60)) * 100;

    return (
                    <div className="Timer-container">
                        <Typography data-testid="mode-label" sx={{ color: 'whitesmoke', fontSize: '30px', mb: 0, fontFamily: 'Poppins, sans-serif', fontWeight: 600, letterSpacing: '0.5px' }}>
                            {isBreak ? 'Break Time' : 'Work Time'}
                        </Typography>
                        <div className="Timer">
                            <Typography id="timeLeft" sx={{ color: 'whitesmoke', fontSize: '80px', mb: 1, fontFamily: 'Poppins, sans-serif', fontWeight: 700, letterSpacing: '2px' }}>
                                {`${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}`}
                            </Typography>
                            <LinearProgress
                                variant="determinate"
                                value={progress}
                                sx={{
                                    width: '100%',
                                    height: 10,
                                    backgroundColor: '#f3f3f3',
                                    '& .MuiLinearProgress-bar': {
                                        backgroundColor: isBreak ? '#a5d6a7' : '#a5d6a7',
                                    },
                                }}
                            />
                        </div>
                        <div className="slidersWrapper">
                            <div className="sliderItem">
                                <Typography data-testid="timer-label" sx={{ color: 'whitesmoke', fontSize: '18px', mb: 1, fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
                                    Work Time
                                </Typography>
                                <Slider
                                    id="workSlider"
                                    value={workMinutes}
                                    onChange={(e, newValue) => {
                                        setWorkMinutes(newValue);
                                        if (!hasStarted && !isBreak) {
                                            setDuration(newValue * 60);
                                        }
                                    }}
                                    min={1}
                                    max={59}
                                    step={1}
                                    disabled={hasStarted}
                                    valueLabelDisplay="auto"
                                    sx={{ color: '#a5d6a7' }}
                                />
                            </div>
                            <div className="sliderItem">
                                <Typography data-testid="timer-label" sx={{ color: 'whitesmoke', fontSize: '18px', mb: 1, fontFamily: 'Poppins, sans-serif', fontWeight: 500 }}>
                                    Break Time
                                </Typography>
                                <Slider
                                    id="breakSlider"
                                    value={breakMinutes}
                                    onChange={(e, newValue) => {
                                        setBreakMinutes(newValue);
                                        if (!hasStarted && isBreak) {
                                            setDuration(newValue * 60);
                                        }
                                    }}
                                    min={1}
                                    max={15}
                                    step={1}
                                    disabled={hasStarted}
                                    valueLabelDisplay="auto"
                                    sx={{ color: '#a5d6a7' }}
                                />
                            </div>
                        </div>
                        <ThemeProvider theme={theme}>
                            <div>
                                <IconButton onClick={handleStart} disabled={isActive} data-testid="start-btn">
                                    <PlayArrowIcon sx={{ color: isActive ? theme.palette.leaf.disabled : theme.palette.leaf.main }} />
                                </IconButton>
                                <IconButton onClick={handlePause} disabled={!isActive} data-testid="pause-btn">
                                    <PauseIcon sx={{ color: isActive ? theme.palette.leaf.main : theme.palette.leaf.disabled }} />
                                </IconButton>
                                <Button onClick={handleReset} variant="contained" color="leaf" data-testid="reset-btn">
                                    <div style={{ color: 'whitesmoke' }}>Reset</div>
                                </Button>
                            </div>
                        </ThemeProvider>
                    </div>

    );
}