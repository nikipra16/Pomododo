import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
    const [hasStarted, setHasStarted] = useState(false);

    return (
        <AppContext.Provider value={{ hasStarted, setHasStarted }}>
            {children}
        </AppContext.Provider>
    );
};
