import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import AppWrapper from '/src/App.jsx';  // Correct path to AppWrapper

try {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('pomododoReduceMotion') === '1') {
        document.documentElement.classList.add('reduce-motion');
    }
} catch {
    /* ignore */
}

// Render the AppWrapper, which contains routing and everything
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AppWrapper /> 
    </StrictMode>,
);
