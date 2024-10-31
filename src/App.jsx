
import './App.css'
import './index.css'
import { useState, useEffect } from 'react';

function App() {
    const [minutes, setMinutes] = useState(25);
    const [seconds, setSeconds] = useState(0);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive && (minutes > 0 || seconds > 0)) {
            interval = setInterval(() => {
                if (seconds === 0) {
                    setMinutes((prevMinutes) => prevMinutes - 1);
                    setSeconds(59);
                } else {
                    setSeconds((prevSeconds) => prevSeconds - 1);
                }
            }, 1000);
        } else if (!isActive) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds, minutes]);

    const resetTimer = () => {
        setIsActive(false);
        setMinutes(25);
        setSeconds(0);
    };

    const timerState = () => {
        setIsActive(!isActive);
    }


  return (
      <div className="container">
          <h1>POMODORO</h1>
          <div className="clock">
              <h1>{`${minutes}:${String(seconds).padStart(2, '0')}`}</h1> {/* Display time */}
              <button onClick={timerState}>{isActive ? 'Pause' : 'Start'}</button>
              <button onClick={resetTimer}>Reset</button>
          </div>
      </div>
  )
}

export default App
