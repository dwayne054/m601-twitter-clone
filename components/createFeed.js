import { getFirestore, doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import AppState from "./state.js";

// Add these import statements if not already present
import { getDatabase, ref, update } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { dbFirestore } from "../api/firebase.js";

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
        // Directly remove the unfollowUserId from the current user's following list
        await updateDoc(currentUserRef, {
            following: arrayRemove(unfollowUserId)
        });

        // Directly remove the currentUserId from the unfollow user's followers list
        await updateDoc(unfollowUserRef, {
            followers: arrayRemove(currentUserId)
        });

        console.log("Unfollowed user successfully.");
    } catch (error) {
        console.error("Failed to unfollow user:", error);
    }
}




/**
 * Renders tweets in the specified container.
 * 
 * @param {Array} tweets - The array of tweet objects to render.
 * @param {HTMLElement} tweetsContainer - The DOM element where tweets will be rendered.
 * @param {boolean} append - Determines if tweets should be appended to the container or replace its current content.
 */

async function renderTweets(tweets,tweetsContainer, append = false) {
    if (!(tweetsContainer instanceof HTMLElement)) {
        console.error('renderTweets: Invalid tweetsContainer parameter. Expected an HTMLElement.');
        return;
    }
    if (!Array.isArray(tweets)) {
        console.error('renderTweets: Invalid tweets parameter. Expected an array of tweet objects.');
        return;
    }
    
    const currentUserId = AppState.getState().user.uid;
    // Fetch the list of user IDs the current user is following
    // This is a placeholder function call, replace it with your actual function to fetch following IDs
    const following = await getCurrentUserFollowing(currentUserId); // Assume this function returns an array of user IDs

    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingDiv';
    loadingDiv.textContent = 'Loading tweets...'; // Customize as needed
    loadingDiv.classList.add('loading'); // Add a class for styling
    // Display loading message only if tweets are not being appended
    if (!append) {
        tweetsContainer.appendChild(loadingDiv);
    }

    
    tweets = tweets.sort((a, b) => b.timestamp - a.timestamp);

    if (!append) {
        while (tweetsContainer.firstChild) {
            tweetsContainer.removeChild(tweetsContainer.firstChild);
        }
    }

    if (!tweets || tweets.length === 0) {
        const noTweetsElement = document.createElement('p');
        noTweetsElement.textContent = 'No tweets found';
        tweetsContainer.appendChild(noTweetsElement);
        return;
    }

    for (let tweet of tweets) {
        const userProfile = await getUserProfile(tweet.userId);
      
        const profilePictureUrl = userProfile.profilePicture;

        const tweetElement = document.createElement('div');
        tweetElement.classList.add('tweet');

        const profilePicDiv = document.createElement('div');
        profilePicDiv.classList.add('profile-pic-div');
        tweetElement.appendChild(profilePicDiv)

        const contentDiv = document.createElement('div');
        contentDiv.classList.add('content-div');
        tweetElement.appendChild(contentDiv)

        const profilePicElement = document.createElement('img');
        profilePicElement.src = profilePictureUrl;
        profilePicElement.alt = `${userProfile.username}'s profile picture`;
        profilePicElement.classList.add('profile-pic');

        const postInfo = document.createElement('div');
        postInfo.classList.add('post-info');
        
        const displayName = document.createElement('h1')
        displayName.textContent = `${userProfile.name}`;

        const usernameElement = document.createElement('p');
        usernameElement.textContent = `@${userProfile.username}`;
        const timestampElement = document.createElement('p');
        timestampElement.textContent = formatTweetDate(tweet.timestamp);
        postInfo.append( displayName,usernameElement, timestampElement)

        const contentElement = document.createElement('p');
        contentElement.className = "tweet-message";
        contentElement.textContent = tweet.content;
        
        profilePicDiv.append(profilePicElement);
        contentDiv.append(postInfo, contentElement);

        // Check if the tweet has an image URL and display it
        if (tweet.imageUrl) {
            const tweetImage = document.createElement('img');
            tweetImage.src = tweet.imageUrl;
            tweetImage.alt = "Tweet image";
            tweetImage.classList.add('tweet-image'); // Add your styling class for tweet images
            contentDiv.appendChild(tweetImage);
        }




        // Follow/Unfollow button logic
        if (tweet.userId !== currentUserId) {
            const actionButton = document.createElement('button');
            actionButton.textContent = following.includes(tweet.userId) ? 'Unfollow' : 'Follow';
            actionButton.className = following.includes(tweet.userId) ? 'unfollow' : 'follow';

            actionButton.onclick = async () => {
                actionButton.disabled = true; // Disable button to prevent multiple clicks
                if (actionButton.textContent === 'Follow') {
                    await followUser(currentUserId, tweet.userId);
                    actionButton.className = "unfollow";
                    actionButton.textContent = 'Unfollow';
                    following.push(tweet.userId); // Update local following list
                } else {
                    await unfollowUser(currentUserId, tweet.userId);
                    actionButton.className = "follow";
                    actionButton.textContent = 'Follow';
                    const index = following.indexOf(tweet.userId);
                    if (index > -1) following.splice(index, 1); // Update local following list
                }
                actionButton.disabled = false; // Re-enable button
            };
            contentDiv.appendChild(actionButton);
        }
        

        tweetsContainer.appendChild(tweetElement);
    }
}

async function getUserProfile(uid) {
    
    const userRef = doc(dbFirestore, "users", uid); 
   
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
        return docSnap.data();
    } else {
        console.log("No such document!");
        return {}; // Return an empty object if the user profile doesn't exist
    }
}


function formatTweetDate(timestamp) {
    // Check if 'timestamp' is a Firestore timestamp object and convert to JavaScript Date
    const tweetDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - tweetDate) / 1000; // difference in seconds

    // Check for different thresholds
    if (diffTime < 60) {
        return `${Math.floor(diffTime)}s`; // seconds
    } else if (diffTime < 3600) {
        return `${Math.floor(diffTime / 60)}min`; // minutes
    } else if (diffTime < 86400) {
        const hours = Math.floor(diffTime / 3600);
        const minutes = Math.floor((diffTime % 3600) / 60);
        return `${hours}hr ${minutes}min`; // hours and minutes
    } else {
        // If the tweet was created more than 24 hours ago, show date in "Month Date" format
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const month = monthNames[tweetDate.getMonth()];
        const date = tweetDate.getDate();
        return `${month} ${date}`;
    }
}









export { renderTweets, followUser, getCurrentUserFollowing,formatTweetDate };





