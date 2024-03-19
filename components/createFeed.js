import { getFirestore, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import AppState from "./state.js";
import { fetchTweetsFromFollowing } from '../api/fetchTweets.js';
// Add these import statements if not already present
import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";


// Get current user's following list
async function getCurrentUserFollowing() {
    const db = getFirestore();
    const state = AppState.getState();
    const currentUserRef = doc(db, `users/${state.user.uid}`);
    try {
        const docSnap = await getDoc(currentUserRef);
        if (docSnap.exists()) {
            return docSnap.data().following || [];
        } else {
            console.log("No such document for the current user!");
            return [];
        }
    } catch (error) {
        console.error("Error getting document:", error);
        return [];
    }
}

// Follow another user
async function followUser(currentUserId, followUserId) {
    if (!currentUserId || !followUserId) {
        console.error("Invalid user ID(s). Current User ID:", currentUserId, "Follow User ID:", followUserId);
        return;
    }

    const db = getFirestore();
    const currentUserRef = doc(db, "users", currentUserId);
    const followUserRef = doc(db, "users", followUserId);

    try {
        // Add followUserId to current user's following list
        await updateDoc(currentUserRef, {
            following: arrayUnion(followUserId)
        });

        // Add currentUserId to follow user's followers list
        await updateDoc(followUserRef, {
            followers: arrayUnion(currentUserId)
        });

        console.log("Follow relationship updated successfully.");
    } catch (error) {
        console.error("Failed to update follow relationship:", error);
    }
}

async function unfollowUser(currentUserId, unfollowUserId) {
    if (!currentUserId || !unfollowUserId) {
        console.error("Invalid user ID(s). Current User ID:", currentUserId, "Unfollow User ID:", unfollowUserId);
        return;
    }
    
    const db = getFirestore();
    const currentUserRef = doc(db, "users", currentUserId);
    const unfollowUserRef = doc(db, "users", unfollowUserId);

    try {
        const currentUserDoc = await getDoc(currentUserRef);
        const unfollowUserDoc = await getDoc(unfollowUserRef);

        if (!currentUserDoc.exists() || !unfollowUserDoc.exists()) {
            console.error("User(s) do not exist.");
            return;
        }

        // Remove unfollowUserId from current user's following list
        const updatedFollowingList = currentUserDoc.data().following.filter(id => id !== unfollowUserId);
        await updateDoc(currentUserRef, { following: updatedFollowingList });

        // Remove currentUserId from unfollow user's followers list
        const updatedFollowersList = unfollowUserDoc.data().followers.filter(id => id !== currentUserId);
        await updateDoc(unfollowUserRef, { followers: updatedFollowersList });

        console.log("Unfollowed user successfully.");
    } catch (error) {
        console.error("Failed to unfollow user:", error);
    }
}


// Render tweets and dynamically show 'Follow' button
// Assuming getCurrentUserFollowing and followUser are defined and work correctly.
// Assuming there's an unfollowUser function similar to followUser but for unfollowing.
async function renderTweets(tweetsContainer) {
    const currentUserId = AppState.getState().user.uid;
    const following = await getCurrentUserFollowing();
    let tweets = await fetchTweetsFromFollowing();

    // Sort tweets by timestamp in descending order to show the most recent posts at the top
    tweets = tweets.sort((a, b) => b.timestamp - a.timestamp);

    // Clear existing content
    while (tweetsContainer.firstChild) {
        tweetsContainer.removeChild(tweetsContainer.firstChild);
    }

    if (!tweets || tweets.length === 0) {
        const noTweetsElement = document.createElement('p');
        noTweetsElement.textContent = 'No tweets found';
        tweetsContainer.appendChild(noTweetsElement);
        return;
    }

    tweets.forEach(tweet => {
        const tweetElement = document.createElement('div');
        tweetElement.classList.add('tweet');

        const usernameElement = document.createElement('p');
        usernameElement.textContent = `@${tweet.username}`;
        const contentElement = document.createElement('p');
        contentElement.textContent = tweet.content;
        
       /*
        const likeButton = document.createElement('button');
        const likesCount = document.createElement('span');
        likesCount.textContent = `${tweet.likes} Likes`;
        likeButton.textContent = "Like";

        // Likes section
        const likesElement = document.createElement('p');
        likesElement.textContent = `Likes: ${tweet.likes.length - 1}`;

        likesElement.appendChild(likeButton)

        // Like/Unlike button
        
        likeButton.textContent = tweet.likes.includes(currentUserId) ? 'Unlike' : 'Like';
        
        likeButton.onclick = async () => {
            likeButton.disabled = true; // Disable the button to prevent multiple clicks
        
            if (likeButton.textContent === 'Like') {
                // Like the tweet
                const updatedLikes = await likeTweet(tweet.id, currentUserId);
                tweet.likes = updatedLikes; // Update local tweet object with new likes array
                likeButton.textContent = 'Unlike'; // Update button text
                likesCount.textContent = `${tweet.likes.length} Likes`; // Update likes count
            } else {
                // Unlike the tweet
                const updatedLikes = await unlikeTweet(tweet.id, currentUserId);
                tweet.likes = updatedLikes; // Update local tweet object with new likes array
                likeButton.textContent = 'Like'; // Update button text
                likesCount.textContent = `${tweet.likes.length} Likes`; // Update likes count
            }
        
            likeButton.disabled = false; // Re-enable the button
        };
        */
       

        const timestampElement = document.createElement('p');
        
        timestampElement.textContent = formatTweetDate(tweet.timestamp);
        
        tweetElement.append(usernameElement, contentElement,  timestampElement);

        // If the current user is not the tweet author
        if (tweet.uid !== currentUserId) {
            const actionButton = document.createElement('button');
            actionButton.textContent = following.includes(tweet.uid) ? 'Unfollow' : 'Follow';

            actionButton.onclick = async () => {
                actionButton.disabled = true; // Disable the button immediately when clicked

                if (actionButton.textContent === 'Follow') {
                    await followUser(currentUserId, tweet.uid);
                    actionButton.textContent = 'Unfollow';
                    // Update the following array to reflect the change
                    following.push(tweet.uid);
                } else {
                    await unfollowUser(currentUserId, tweet.uid);
                    actionButton.textContent = 'Follow';
                    // Update the following array to reflect the change
                    const index = following.indexOf(tweet.uid);
                    if (index > -1) {
                        following.splice(index, 1);
                    }
                }

                actionButton.disabled = false; // Re-enable the button after the operation is completed
            };

            tweetElement.appendChild(actionButton);
        }

        tweetsContainer.appendChild(tweetElement);
    });
}



function formatTweetDate(timestamp) {
    const tweetDate = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - tweetDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
        // If the tweet was created in the last 24 hours, show time in "hh:mm AM/PM" format
        let hours = tweetDate.getHours();
        let minutes = tweetDate.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        return `${hours}:${minutes} ${ampm}`;
    } else {
        // If the tweet was created more than 24 hours ago, show date in "Month Date" format
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[tweetDate.getMonth()];
        const date = tweetDate.getDate();
        return `${month} ${date}`;
    }
}


async function likeTweet(tweetId, userId) {
    const db = getDatabase();
    const tweetRef = ref(db, `tweets/${tweetId}/likes/${userId}`);

    // Set the user ID as a key to indicate a like
    await set(tweetRef, true); // Using true as a simple value, but it can be any value

    // Fetch the updated likes to reflect in the UI
    const updatedTweetRef = ref(db, `tweets/${tweetId}`);
    const snapshot = await get(updatedTweetRef);
    if (snapshot.exists()) {
        return snapshot.val().likes || {};
    } else {
        console.error('Failed to fetch updated tweet after liking');
        return {};
    }
}

async function unlikeTweet(tweetId, userId) {
    const db = getDatabase();
    const tweetRef = ref(db, `tweets/${tweetId}/likes/${userId}`);

    // Remove the user ID key to unlike
    await remove(tweetRef);

    // Fetch the updated likes to reflect in the UI
    const updatedTweetRef = ref(db, `tweets/${tweetId}`);
    const snapshot = await get(updatedTweetRef);
    if (snapshot.exists()) {
        return snapshot.val().likes || {};
    } else {
        console.error('Failed to fetch updated tweet after unliking');
        return {};
    }
}




export { renderTweets, followUser, getCurrentUserFollowing };





