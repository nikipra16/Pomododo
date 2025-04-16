import { useState, useEffect, useRef } from 'react';
import './App.css';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, IconButton, ThemeProvider} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import Header from './components/header/Header.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Slider, Typography } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { LinearProgress } from '@mui/material';


const theme = createTheme({
    palette: {
        leaf: {
            main: '#3f9e34',
            disabled: '#A0D091',
        },
    },
    components: {
        MuiSvgIcon: {
            styleOverrides: {
                root: {
                    color: '#3f9e34',
                },
            },
        },
    },
});




function App() {
    const [workMinutes, setWorkMinutes] = useState(25);
    const [breakMinutes, setBreakMinutes] = useState(5);
    const [duration, setDuration] = useState(workMinutes * 60);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    const intervalRef = useRef(null);
    const startTime = useRef(0);
    const elapsedRef = useRef(0);
    const sessionDur = () => (isBreak ? breakMinutes : workMinutes) * 60 * 1000;

    useEffect(() => {
        localStorage.setItem('workMinutes', workMinutes);
        localStorage.setItem('breakMinutes', breakMinutes);
        localStorage.setItem('duration', duration);
        localStorage.setItem('isActive', isActive.toString());
        localStorage.setItem('isBreak', isBreak.toString());
    }, [workMinutes, breakMinutes, duration, isActive, isBreak, hasStarted]);

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
                        setIsBreak(true);
                        setDuration(breakMinutes * 60);
                        setIsActive(true);
                        startTime.current = Date.now();
                    } else {
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

    const progress = (duration / (isBreak ? breakMinutes * 60 : workMinutes * 60)) * 100;

    return (
        <div className={'mainContainer'}>
            <Header />
            <div className="Timer-container">
                <Typography sx={{ color: 'whitesmoke', fontSize: '30px', mb: 0 }}>
                    {isBreak ? 'Break Time 🤗🥳' : 'Work Time 📚🧑‍💻'}
                </Typography>
                <div className="Timer">
                    <Typography id="timeLeft" sx={{ color: 'whitesmoke', fontSize: '80px', mb: 1 }}>
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
                                backgroundColor: isBreak ? '#4CAF50' : '#3f9e34',
                            },
                        }}
                    />
                </div>
                <div className="slidersWrapper">
                    <div className="sliderItem">
                        <Typography sx={{ color: 'whitesmoke', fontSize: '18px', mb: 1 }}>
                            Work Time
                        </Typography>
                        <Slider
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
                            sx={{ color: '#3f9e34' }}
                        />
                    </div>
                    <div className="sliderItem">
                        <Typography sx={{ color: 'whitesmoke', fontSize: '18px', mb: 1 }}>
                            Break Time
                        </Typography>
                        <Slider
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
                            sx={{ color: '#3f9e34' }}
                        />
                    </div>
                </div>
                <ThemeProvider theme={theme}>
                    <div>
                        <IconButton onClick={handleStart} disabled={isActive}>
                            <PlayArrowIcon
                                sx={{
                                    color: isActive ? theme.palette.leaf.disabled : theme.palette.leaf.main,
                                }}
                            />
                        </IconButton>
                        <IconButton onClick={handlePause} disabled={!isActive}>
                            <PauseIcon
                                sx={{
                                    color: isActive ? theme.palette.leaf.main : theme.palette.leaf.disabled,
                                }}
                            />
                        </IconButton>
                        <Button onClick={handleReset} variant="contained" color="leaf">
                            <div style={{ color: 'whitesmoke' }}>Reset</div>
                        </Button>
                    </div>
                </ThemeProvider>
            </div>
        </div>
    );
}

export default App;