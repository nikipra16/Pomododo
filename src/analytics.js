import { doc, setDoc, increment } from "firebase/firestore";
import { db } from "./firebase";

export async function updateAnalytics(userId, sessionDuration) {
    if (!userId) return;

    const today = new Date();
    const dateKey = today.toISOString().split('T')[0];

    const dailyDocRef = doc(db, "users", userId, "analytics", dateKey);

    await setDoc(
        dailyDocRef,
        {
            dateKey: dateKey,
            totalWorkDuration: increment(sessionDuration),
            pomodoroCount: increment(1),
            lastUpdated: new Date()
        },
        { merge: true }
    );
}