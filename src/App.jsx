import { useState, useEffect } from 'react';
import './App.css';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, TextField, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import Header from './components/header/Header.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';


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
                <h2 id={"timeLeft"}>{`${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`}</h2>
            </div>
            <div className="textbox">
                <TextField
                    label="Work Time (min)"
                    type="number"
                    value={workMinutes}
                    onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        if (value >= 0 && value <= 59) {
                            setWorkMinutes(value);
                        }
                    }}
                    disabled={isActive}
                    variant="outlined"
                    size="small"
                    className="textField"
                    InputLabelProps={{
                        style: {
                            fontSize: '25px',
                            color: 'whitesmoke',
                            transform: 'translate(14px, -22px) scale(0.75)',
                        },
                        shrink: true,
                    }}
                />
            </div>
            <div>
                <TextField
                    label="Break Time (min)"
                    type="number"
                    value={breakMinutes}
                    onChange={(e) => {
                        const value = parseInt(e.target.value) || 0;
                        if (value >= 0 && value <= 59) {
                            setBreakMinutes(value);
                        }
                    }}
                    disabled={isActive}
                    variant="outlined"
                    size="small"
                    className="textField"
                    InputLabelProps={{
                        style: {
                            fontSize: '25px',
                            color: 'whitesmoke',
                            transform: 'translate(14px, -22px) scale(0.75)',
                        },
                        shrink: true,
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
                <Button onClick={handleReset} variant="outlined" color="secondary">
                    Reset
                </Button>
            </div>
        </div>
        </div>
    );
}

export default App;
