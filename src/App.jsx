import { useState, useEffect } from 'react';
import './App.css';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, TextField, IconButton, ThemeProvider} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import Header from './components/header/Header.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Slider, Box, Typography } from '@mui/material';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        leaf: {
            main: '#3f9e34',
            disabled: '#A0D091', // Example of a different color for disabled state
        },
    },
    components: {
        MuiSvgIcon: {
            styleOverrides: {
                root: {
                    color: '#3f9e34', // Default color for icons
                },
            },
        },
    },
});




function App() {
    const [workMinutes, setWorkMinutes] = useState(25);
    const [breakMinutes, setBreakMinutes] = useState(5);
    const [timeLeft, setTimeLeft] = useState(workMinutes * 60);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        let interval = null;

        if (isActive) {
            interval = setInterval(() => {
                setTimeLeft((curr) => {
                    if (curr === 0) {
                        if (!isBreak) {
                            setIsBreak(true);
                            return breakMinutes * 60;
                        } else {
                            setIsBreak(false);
                            return workMinutes * 60;
                        }
                    }
                    return curr - 1;
                });
            }, 1000);
        } else {
            clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [isActive, isBreak, breakMinutes, workMinutes]);

    useEffect(() => {
        if (!isActive && !hasStarted) {
            setTimeLeft(workMinutes * 60);
        }
    }, [workMinutes, breakMinutes, isActive, hasStarted]);

    const handleStart = () => {
        if (!hasStarted) {
            setTimeLeft(isBreak ? breakMinutes * 60 : workMinutes * 60);
        }
        setIsActive(true);
        setHasStarted(true);
    };

    const handlePause = () => {
        setIsActive(false);
    };

    const handleReset = () => {
        setIsActive(false);
        setIsBreak(false);
        setHasStarted(false);
        // setTimeLeft(25 * 60);
        setWorkMinutes(25);
        setBreakMinutes(5);
    };

    return (
        <div className={'mainContainer'}>
            <Header />
        <div className="Timer-container">
            <div className="Timer">
                <Typography id={"timeLeft"} sx={{ color: 'whitesmoke', fontSize: '80px', mb: 1 }}>
                    {`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`}
                </Typography>
                {/*<Typography id={"breakTimeLeft"} sx={{ color: 'whitesmoke', fontSize: '20px', mb: 1 }}>*/}
                {/*    {`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`}*/}
                {/*</Typography>*/}
            </div>
            <div className="textbox">
                <Typography sx={{ color: 'whitesmoke', fontSize: '18px', mb: 1 }}>
                    Work Time
                </Typography>
                <Slider
                    value={workMinutes}
                    onChange={(e, newValue) => {
                        setWorkMinutes(newValue);
                        if (!isActive && !isBreak) {
                            setTimeLeft(newValue * 60);
                        }
                    }}
                    min={1}
                    max={59}
                    step={1}
                    disabled={isActive}
                    valueLabelDisplay="auto"
                    sx={{ color: '#3f9e34' }}
                />
            </div>
            <div>
                <Typography sx={{ color: 'whitesmoke', fontSize: '18px', mb: 1 }}>
                    Break Time
                </Typography>
                <Slider
                    value={breakMinutes}
                    onChange={(e, newValue) => {
                        setBreakMinutes(newValue);
                        if (!isActive && isBreak) {
                            setTimeLeft(newValue * 60);
                        }
                    }}
                    min={1}
                    max={15}
                    step={1}
                    disabled={isActive}
                    valueLabelDisplay="auto"
                    sx={{ color: '#3f9e34' }}
                />
            </div>
            <ThemeProvider theme={theme}>
                <div>
                    <IconButton onClick={handleStart} disabled={isActive} >
                        <PlayArrowIcon sx={{
                            color: isActive ? theme.palette.leaf.disabled : theme.palette.leaf.main,
                        }}/>
                    </IconButton >
                    <IconButton onClick={handlePause} disabled={!isActive}>
                        <PauseIcon sx={{
                            color: isActive ? theme.palette.leaf.main : theme.palette.leaf.disabled,
                        }} />
                    </IconButton>
                    <Button onClick={handleReset} variant="outlined" color="leaf" >
                        Reset
                    </Button>
                </div>
            </ThemeProvider>
        </div>
        </div>
    );
}

export default App;
