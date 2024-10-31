import './App.css'
import './index.css'
import { useState, useEffect } from 'react';

function App() {
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [isBreak, setBreak] = useState(false);

    useEffect(() => {
        let interval = null;

        if (isActive) {
            interval = setInterval(() => {
                if (seconds === 0 && minutes === 0) {

                    if (!isBreak) {
                        setMinutes(5);
                        setSeconds(0);
                        setBreak(true);
                    } else {
                        setIsActive(false);
                    }
                } else if (seconds === 0) {
                    setMinutes((prevMinutes) => prevMinutes - 1);
                    setSeconds(59);
                } else {
                    setSeconds((prevSeconds) => prevSeconds - 1);
                }
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [isActive, seconds, minutes, isBreak]);

    const resetTimer = () => {
        setIsActive(false);
        setMinutes(25);
        setSeconds(0);
        setBreak(false);
    };

    const timerState = () => {
        setIsActive((prev) => !prev);
    };

    return (
        <div className={"container"}>
            <h1>POMODORO</h1>
            <h1>{`${minutes}:${String(seconds).padStart(2, '0')}`}</h1> {/* Display time */}
            <button onClick={timerState}>{isActive ? 'Pause' : 'Start'}</button>
            <button onClick={resetTimer}>Reset</button>
        </div>
    );
}

export default App;
