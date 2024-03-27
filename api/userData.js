import AppState from '../components/state.js';
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

async function getUserData() {
    const state = AppState.getState();
    
    if (!state.user || !state.user.uid) {
        console.error("UID not found. Redirecting to login...");
        AppState.setState({ currentComponent: 'login' });
        return;
    }

    const dbFirestore = getFirestore();
    const userRef = doc(dbFirestore, `users/${state.user.uid}`);

    try {
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
            return userDoc.data();
        } else {
            console.error("No user data found! Redirecting to login...");
            AppState.setState({ currentComponent: 'login' });
            return;
        }
    } catch (error) {
        console.error("Error fetching user data: ", error);
        AppState.setState({ currentComponent: 'login' });
    }
}


export { getUserData };

