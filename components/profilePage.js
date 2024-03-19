import AppState from "./state.js";
import { stateButton } from "./stateButton.js";
import { fetchUserTweets } from "../api/fetchTweets.js"; // Assuming fetchUserTweets is the adjusted function
import { getUserData } from "../api/userData.js";
import { getDatabase, ref, remove, update } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";


function profilePage() {

    const profileContainer = document.createElement('div');
    profileContainer.className = 'profile-container';

    // Append placeholders or loading indicators
    const userNameElement = document.createElement('h2');
    userNameElement.textContent = "Loading username...";
    const userEmailElement = document.createElement('p');
    userEmailElement.textContent = "Loading email...";
    const profilePicElement = document.createElement('img');
    profilePicElement.src = ""; // Adjust path as needed
    profilePicElement.alt = 'Profile Picture';
    profilePicElement.style.width = '100px';
    profileContainer.append(userNameElement, userEmailElement, profilePicElement);

    // Followers and Following placeholders
    const followersElement = document.createElement('p');
    followersElement.textContent = "Followers: Loading...";
    const followingElement = document.createElement('p');
    followingElement.textContent = "Following: Loading...";
    profileContainer.append(followersElement, followingElement);

    getUserData().then(userData => {
        userNameElement.textContent = `Username: ${userData.username}`;
        userEmailElement.textContent = `Email: ${userData.email}`;
        profilePicElement.src = userData.profilePicture;
        followersElement.textContent = `Followers: ${userData.followers?.length || 0}`;
        followingElement.textContent = `Following: ${userData.following?.length || 0}`;
    }).catch(error => console.error("Error fetching user data:", error));

    // Section to hold tweets
    const tweetsSection = document.createElement('div');
    profileContainer.appendChild(tweetsSection);

    fetchUserTweets(AppState.getState().user.uid).then(userTweets => {
        updateTweetsSection(tweetsSection, userTweets);
    });

    // Home button to navigate back
    const homeButton = stateButton('home');
    profileContainer.appendChild(homeButton);

    // Home button to navigate back
    const logoutButton = stateButton('logout');
    profileContainer.appendChild(logoutButton);

    return profileContainer;
}

function removeTweet(tweetId, tweetsSection) {
    const db = getDatabase();
    const tweetRef = ref(db, `tweets/${tweetId}`);

    remove(tweetRef)
        .then(() => {
            console.log('Tweet removed successfully');
            // Optionally refresh the tweet section to reflect the deletion
            fetchUserTweets(AppState.getState().user.uid).then(userTweets => {
                updateTweetsSection(tweetsSection, userTweets);
            });
        })
        .catch(error => {
            console.error('Failed to remove tweet:', error);
        });
}

// Revised updateTweetsSection function with added checks
function updateTweetsSection(tweetsSection, userTweets) {
    if (!tweetsSection) return;

    while (tweetsSection.firstChild) {
        tweetsSection.removeChild(tweetsSection.firstChild);
    }

    userTweets.forEach(tweet => {
        const tweetElement = document.createElement('div');
        tweetElement.className = 'tweet'; // Add a class for styling and selection

        // User
        const tweetUser = document.createElement('p');
        tweetUser.textContent = tweet.username; // Fixed method call
        tweetElement.appendChild(tweetUser);

        // Content
        const tweetContent = document.createElement('p');
        tweetContent.className = 'tweet-content'; // Add class for selection
        tweetContent.textContent = tweet.content; // Fixed method call
        tweetElement.appendChild(tweetContent);

        // Edit and Delete buttons
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.className = 'edit-button'; // Add class for selection

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.className = 'delete-button'; // Add class for selection

        editButton.onclick = () => editTweet(tweet.id, tweetElement); // Pass the tweet element
        deleteButton.onclick = () => removeTweet(tweet.id, tweetsSection);

        tweetElement.appendChild(editButton);
        tweetElement.appendChild(deleteButton);
        tweetsSection.appendChild(tweetElement);
    });
}



function editTweet(tweetId, tweetElement) {
    // Find the elements within the tweetElement
    const contentElement = tweetElement.querySelector('.tweet-content');
    const buttons = tweetElement.querySelectorAll('button'); // Simplify selector if all buttons should be hidden
    
    // Verify that contentElement and buttons were found
    if (!contentElement || buttons.length === 0) {
        console.error("Invalid tweet element provided to editTweet function.");
        return;
    }

    // Hide existing content and buttons
    contentElement.style.display = 'none';
    buttons.forEach(button => button.style.display = 'none');

    // Create an input field for editing content
    const editInput = document.createElement('input');
    editInput.type = 'text';
    editInput.value = contentElement.textContent;
    editInput.className = 'edit-input';

    // Create a save button
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';

    // Insert the input and save button before the content element
    contentElement.parentNode.insertBefore(editInput, contentElement);
    contentElement.parentNode.insertBefore(saveButton, contentElement.nextSibling); // Insert after contentElement

    editInput.focus();

    // Event listener for the save button
    saveButton.addEventListener('click', async () => {
        const newContent = editInput.value.trim();
        if (newContent && newContent !== contentElement.textContent) {
            // Update the database with new content
            await update(ref(getDatabase(), `tweets/${tweetId}`), { content: newContent });

            // Update UI
            contentElement.textContent = newContent;
            editInput.remove();
            saveButton.remove();
            contentElement.style.display = '';
            buttons.forEach(button => button.style.display = '');
        } else {
            // If no changes, just cleanup without updating
            editInput.remove();
            saveButton.remove();
            contentElement.style.display = '';
            buttons.forEach(button => button.style.display = '');
        }
    });
}





export { profilePage, removeTweet, editTweet };
