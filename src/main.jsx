import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import AppWrapper from '/src/App.jsx';  // Correct path to AppWrapper

// Render the AppWrapper, which contains routing and everything
createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AppWrapper />  {/* Use AppWrapper here */}
    </StrictMode>,
);
