import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

function trimEnv(value) {
    return typeof value === 'string' ? value.trim() : value;
}

const firebaseConfig = {
    apiKey: trimEnv(import.meta.env.VITE_FIREBASE_API_KEY),
    authDomain: trimEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
    projectId: trimEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID),
    storageBucket: trimEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: trimEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
    appId: trimEnv(import.meta.env.VITE_FIREBASE_APP_ID),
    measurementId: trimEnv(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID),
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize Analytics only if in browser and not in development
let analytics = null;
if (typeof window !== 'undefined' && import.meta.env.PROD) {
    try {
        analytics = getAnalytics(app);
    } catch (error) {
        console.warn('Firebase Analytics initialization failed:', error);
        // Analytics will be null, but app will still work
    }
}
export { analytics };