import { useState, useEffect } from 'react';
import './App.css';
import './index.css';
import { Button } from '@mui/material';
import { TextField } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
function App() {
    const [workMinutes, setWorkMinutes] = useState(50);
    const [breakMinutes, setBreakMinutes] = useState(10);
    const [minutes, setMinutes] = useState(workMinutes);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setIsBreak] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);


    useEffect(() => {
        let interval = null;

        if (isActive) {
            interval = setInterval(() => {
                if (minutes === 0 && seconds === 0) {
                    if (!isBreak) {
                        setMinutes(breakMinutes);
                        setIsBreak(true);
                    } else {
                        setMinutes(workMinutes);
                        setIsBreak(false);
                    }
                    setSeconds(0);
                } else if (seconds === 0) {
                    setMinutes((curr) => curr - 1);
                    setSeconds(59);
                } else {
                    setSeconds((curr) => curr - 1);
                }
            }, 1000);
        } else {
            clearInterval(interval);
        }

        return () => clearInterval(interval);
    }, [isActive, seconds, minutes, isBreak, workMinutes, breakMinutes]);


    useEffect(() => {
        if (!isActive && !hasStarted) {
            setMinutes(workMinutes);
        }
    }, [workMinutes, breakMinutes, isActive, hasStarted]);

    const handleStart = () => {
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
        setMinutes(workMinutes);
        setSeconds(0);
    };

    return (
        <div className="container">
            <div className={'pomodoro'}>POMODORO</div>
            <div className={'Timer'}>
                <h2>{`${minutes}:${String(seconds).padStart(2, '0')}`}</h2> {/* Display timer */}
            </div>
            <div>
                <TextField
                    label="Work Time (min)"
                    type="number"
                    value={workMinutes}
                    onChange={(e) => setWorkMinutes(parseInt(e.target.value) || 0)}
                    disabled={isActive}
                    variant="outlined"
                    size="small"
                    className="textField"
                    InputLabelProps={{
                        style: {
                            fontSize: '20px',
                            color: '#1976d2',
                        }
                    }}
                />
            </div>
            <div>
                <TextField
                    label="Break Time (min)"
                    type="number"
                    value={breakMinutes}
                    onChange={(e) => setBreakMinutes(parseInt(e.target.value) || 0)}
                    disabled={isActive}
                    variant="outlined"
                    size="small"
                    className="textField"
                    InputLabelProps={{
                        style: {
                            fontSize: '20px',
                            color: '#1976d2',
                        }
                    }}

                />
            </div>
            <div>
                <IconButton onClick={handleStart} disabled={isActive}>
                    <PlayArrowIcon/>
                </IconButton>
                <IconButton onClick={handlePause} disabled={!isActive}>
                    <PauseIcon/>
                </IconButton>
                <Button
                    onClick={handleReset}
                    variant="outlined"
                    color="secondary"
                >
                    Reset
                </Button>
            </div>
        </div>
    );
}

export default App;
