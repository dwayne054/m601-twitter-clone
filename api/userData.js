import AppState from '../components/state.js';
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";


async function getUserData(){
    const state = AppState.getState();
    const dbFirestore = getFirestore();
    const userRef = doc(dbFirestore, `users/${state.user.uid}`);

    // Fetch user details from Firestore
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists()) {
        console.error("No user data found!");
        return;
    }
    const userData = userDoc.data();
    return userData
}

export { getUserData }