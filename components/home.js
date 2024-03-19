import AppState from './state.js';
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { fetchTweetsFromFollowing } from '../api/fetchTweets.js';
import { createTweetForm } from './createTweet.js';
import { renderTweets } from './createFeed.js';
import { refreshTweets } from './createTweet.js';
import { stateButton } from './stateButton.js';
import { getUserData } from '../api/userData.js';


// Assuming getUserData and renderTweets return Promises.
function createHomeComponent() {
    const homeComponent = document.createElement('div');
    homeComponent.classList.add('home-component');

    // Prepare a container for tweets that might be fetched later
    const tweetsContainer = document.createElement('div');
    tweetsContainer.classList.add('tweets-container');
    homeComponent.appendChild(tweetsContainer);

    // Prepare the tweet form
    const tweetFormComponent = createTweetForm(tweetsContainer); // Assuming createTweetForm() returns a DOM element immediately
    homeComponent.appendChild(tweetFormComponent);

    // Profile page button
    const profilePageSwitch = stateButton('profile');
    homeComponent.appendChild(profilePageSwitch);

    // Refresh feed button
    const refreshFeedButton = document.createElement('button');
    refreshFeedButton.textContent = "Refresh Feed";
    refreshFeedButton.addEventListener('click', () => renderTweets(tweetsContainer));
    homeComponent.appendChild(refreshFeedButton);

    getUserData().then(userData => {
        // Assuming userData contains { username, followers, following, profilePicture }
        const userNameElement = document.createElement('p');
        userNameElement.textContent = `Username: ${userData.username || 'No username'}`;
        homeComponent.prepend(userNameElement);

        

        const profilePicElement = document.createElement('img');
        profilePicElement.src = userData.profilePicture || 'default_profile_pic_url';
        profilePicElement.alt = 'Profile Picture';
        profilePicElement.style.width = '100px'; // Example styling
        homeComponent.prepend(profilePicElement);
    }).catch(error => console.error("Error fetching user data:", error));

    // Initial call to fetch and display tweets
    renderTweets(tweetsContainer);

    return homeComponent;
}


export { createHomeComponent };
