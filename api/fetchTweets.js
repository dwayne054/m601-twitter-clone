import { getFirestore, query, collection, where, getDocs, doc, getDoc, orderBy, limit as firestoreLimit, startAfter } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { dbFirestore } from "./firebase.js"; 



class TweetsPagination {
    constructor() {
        this.reset();
    }

    reset() {
        this.lastVisible = null;
    }

    async fetchNext() {
        const db = getFirestore();
        const tweetsColRef = collection(db, "tweets");
        let constraints = [orderBy("timestamp", "desc"), firestoreLimit(10)];

        if (this.lastVisible) constraints.push(startAfter(this.lastVisible));

        const q = query(tweetsColRef, ...constraints);

        try {
            const snapshot = await getDocs(q);
            if (snapshot.empty) return [];

            this.lastVisible = snapshot.docs[snapshot.docs.length - 1]; // Update the last visible for next fetch

            // Process and return tweets...
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error("Failed to fetch tweets:", error);
            return [];
        }
    }
}


async function fetchUserTweets(userId) {
    const tweetsColRef = collection(dbFirestore, "tweets"); // Reference to the 'tweets' collection
    const userRef = doc(dbFirestore, "users", userId); // Reference to the user's document
    const q = query(tweetsColRef, where("userId", "==", userId), orderBy("timestamp", "desc")); // Query tweets by userId

    try {
        // Fetch user profile data
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            console.log('User profile not found:', userId);
            return [];
        }
        const userProfile = userSnap.data();

        // Fetch tweets
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            console.log('No tweets found for user:', userId);
            return [];
        }

        // Map tweets and include user profile data
        const tweetsWithUserData = querySnapshot.docs.map((tweetDoc) => {
            const tweetData = tweetDoc.data();
            return {
                id: tweetDoc.id,
                ...tweetData,
                username: userProfile.username, // Include username from the user profile
                name: userProfile.name || userProfile.username, // Include name or fallback to username
                profilePicture: userProfile.profilePicture // Include profile picture URL from the user profile
            };
        });

        return tweetsWithUserData;
    } catch (error) {
        console.error("Failed to fetch user's tweets:", error);
        return [];
    }
}



export { TweetsPagination , fetchUserTweets};
