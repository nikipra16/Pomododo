import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "/src/firebase.js";
import { createContext, useContext, useEffect, useState } from "react";
import Header from '/src/components/header/Header.jsx';
import Button from '@mui/material/Button';
import 'bootstrap/dist/css/bootstrap.min.css';
import LogIn from "../login/login.jsx";
import Profile from '/src/components/profile/profile.jsx'

// TO DO : user login status, profile photo,

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);