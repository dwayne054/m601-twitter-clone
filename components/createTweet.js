// Adjust the import paths as needed
import { getDatabase, ref, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import AppState from './state.js'; // Adjust the import path as needed
// refreshTweets.js
import { renderTweets } from './createFeed.js'; // Adjust import path as needed
import { fetchTweetsFromFollowing } from "../api/fetchTweets.js";




async function refreshTweets() {
    const fetchedTweets = await fetchTweetsFromFollowing()
    console.log(fetchedTweets)
    return fetchedTweets
}



async function createTweet(content) {
    const db = getDatabase();
    const dbFirestore = getFirestore();
    const userId = AppState.getState().user.uid;
    
    // Fetch the username from Firestore
    const userRef = doc(dbFirestore, "users", userId);
    const userSnap = await getDoc(userRef);
    
    let username = "";
    if (userSnap.exists()) {
        username = userSnap.data().username;
    } else {
        console.error("User not found");
        return;
    }

    // Initialize likes as an empty object
    let likes = "";

    // Create a new tweet object
    const newTweet = {
        userId,
        username,
        content,
        timestamp: serverTimestamp(),
        likes,
    };
    
    // Push the new tweet to the Realtime Database
    return push(ref(db, 'tweets'), newTweet)
        .then(() => console.log('Tweet created successfully.'))
        .catch(error => console.error('Failed to create tweet:', error));
}




// Adjust the createTweetForm function to accept the refreshCallback argument
function createTweetForm(parentContainer) { // Now accepting refreshCallback as an argument
    const formContainer = document.createElement('div');
    formContainer.classList.add('tweet-form-container');

    const tweetForm = document.createElement('form');
    const createTweetInput = document.createElement('input');
    createTweetInput.placeholder = "What's happening?";
    const tweetSubmitButton = document.createElement('button');
    tweetSubmitButton.textContent = 'Tweet';

    tweetForm.appendChild(createTweetInput);
    tweetForm.appendChild(tweetSubmitButton);
    formContainer.appendChild(tweetForm);

    tweetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tweetContent = createTweetInput.value.trim();
        if (tweetContent) {
            await createTweet(tweetContent); // Await the tweet creation
            createTweetInput.value = ''; // Clear the input
            renderTweets(parentContainer)
        }
    });

    return formContainer;
}




export { createTweet, createTweetForm, refreshTweets };
