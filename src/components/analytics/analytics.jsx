import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

import { analytics } from "/src/firebase.js";
import { logEvent } from "firebase/analytics";

export const logUserEvent = (eventName, eventParams = {}) => {
    try {
        if (analytics) {
        logEvent(analytics, eventName, eventParams);
        }
    } catch (err) {
        console.warn("Analytics event not logged:", err);
    }
};