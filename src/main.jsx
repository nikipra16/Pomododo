import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import AppWrapper from '/src/App.jsx';  // Correct path to AppWrapper
import { registerServiceWorker } from '/src/utils/registerSW.js';

// Service worker disabled to prevent caching issues during development
// Uncomment the line below to re-enable service worker for production
// registerServiceWorker();

// Render the AppWrapper, which contains routing and everything
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AppWrapper /> 
    </StrictMode>,
);
