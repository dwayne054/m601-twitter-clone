import AppState from './state.js';
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

import { createTweetForm } from './createTweet.js';
import { renderTweets } from './createFeed.js';
import { refreshTweets } from './createTweet.js';
import { stateButton } from './stateButton.js';
import { getUserData } from '../api/userData.js';
import { profilePage } from './profilePage.js';
import { updateUI } from '../app.js';
import { TweetsPagination } from '../api/fetchTweets.js';

let currentPage = 'Home';

function createHomeComponent() {
    const homeComponent = document.createElement('div');
    homeComponent.classList.add('home-component');

    //tab container
    const tabComponent = document.createElement('div');
    tabComponent.className = 'tab-component';


    // feed container
    const middleComponent = document.createElement('div');
    middleComponent.className = 'middle-component';

    // whitespace container
    const rightComponent = document.createElement('div');
    rightComponent.className = 'right-component';

    // appending each of the three home container
    homeComponent.appendChild(tabComponent);
    homeComponent.appendChild(middleComponent);
    homeComponent.appendChild(rightComponent);
    
    // tab container
    const tabContainer = document.createElement('div')
    tabContainer.className = 'tab-container'
    tabComponent.appendChild(tabContainer)


    //icon
    const twitterLogobutton = createButton('','twitter-logo');
    twitterLogobutton.className = "tab-button"
    tabContainer.appendChild(twitterLogobutton);
    const tabTwitterIcon = document.createElement('img');
    tabTwitterIcon.className = "tab-icon-logo";
    tabTwitterIcon.src = '../assets/logo.png'
    const twitterLogoText = document.createElement('h1');
    twitterLogoText.textContent = ""
    twitterLogobutton.appendChild(tabTwitterIcon)
    twitterLogobutton.appendChild(twitterLogoText)



    
    // home tab switch button
    const homePageSwitch = stateButton('','home-button');
    homePageSwitch.className = "tab-button";
    tabContainer.appendChild(homePageSwitch);
    const homeIcon = document.createElement('img');
    homeIcon.className = "tab-icon";
    homeIcon.src = '../assets/home-blue.svg';
    const homeTabText = document.createElement('h1');
    homeTabText.style.color = "#1DA1F2";
    homeTabText.textContent = "Home";
    homePageSwitch.appendChild(homeIcon);
    homePageSwitch.appendChild(homeTabText);

    // Profile tab switch button
    const profilePageSwitch = createButton('', 'profile-switch');
    profilePageSwitch.className = "tab-button";
    tabContainer.appendChild(profilePageSwitch);
    const profileIcon = document.createElement('img');
    profileIcon.className = "tab-icon";
    profileIcon.src = '../assets/user-grey.svg';
    const profileTabText = document.createElement('h1');
    profileTabText.textContent = "Profile";
    profilePageSwitch.appendChild(profileIcon)
    profilePageSwitch.appendChild(profileTabText)
    
    // tweet button 
    const tweetButtonTab = createButton('', 'tweet-tab-button');
    tweetButtonTab.className = "tab-button";
    const tweetButtonTabText = document.createElement('p');
    tweetButtonTabText.textContent = 'Tweet'
    tweetButtonTab.appendChild(tweetButtonTabText)
    tabContainer.appendChild(tweetButtonTab)

    // event listener for tweet button 
    tweetButtonTab.addEventListener('click', () => {
    
        
        if ( currentPage === "Profile") {
            
            homePageSwitch.click()

           
        } else {
            // Scroll the feed to bring the tweet form into view
            tweetFormComponent.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
            lastTweetKey = null;
            
        }
    })

    

    // event listener for the home page
    homePageSwitch.addEventListener('click', () => {
        currentPage = "Home";
        
        // Reset pagination and fetch tweets
        tweetsPagination.fetchNext(true).then(newTweets => {
            clearTweetsFromDOM(tweetsContainer);
            renderTweets(newTweets, tweetsContainer, false);
        }).catch(error => {
            console.error("Error fetching tweets for home page:", error);
        });
    });
    
    function clearTweetsFromDOM(tweetsContainer) {
        while (tweetsContainer.firstChild) {
            tweetsContainer.removeChild(tweetsContainer.firstChild);
        }
    }
    

    // event listener form the profile page 
    profilePageSwitch.addEventListener('click', () => {
        // Remove current middle component
        tweetsContainer.remove();
        tweetFormBackground.remove();
        endText.remove()

        // changing active tab color
        homeIcon.src = '../assets/home-grey.svg';
        homeTabText.style.color = "#657786";
        profileIcon.src = '../assets/user-blue.svg';
        profileTabText.style.color = "#1DA1F2";

        endText.style.display = "none";
        
        if ( currentPage === "Home") {
            // Create and append profile page component
            const profilePageComponent = profilePage();
            
            middleComponent.appendChild(profilePageComponent);
            currentPage = "Profile";
            

        }
     
    });

    // profile info tab container
    const tabProfileInfo = document.createElement('div');
    tabProfileInfo.className = 'profile-info-tab-div'
    tabContainer.appendChild(tabProfileInfo);


    //TODO:  middle section seperator - feed logic
    
    
    // Prepare a container for tweets
    const tweetsContainer = document.createElement('div');
    tweetsContainer.classList.add('tweets-container');
    
   

    // Prepare the tweet form background
    const tweetFormBackground = document.createElement('div');
    tweetFormBackground.classList.add('tweet-form-background');
    middleComponent.appendChild(tweetFormBackground);

    // Assuming createTweetForm() returns a DOM element
    const tweetFormComponent = createTweetForm(tweetsContainer);
    tweetFormBackground.appendChild(tweetFormComponent);
    
    // Append tweets container to the home component
    middleComponent.appendChild(tweetsContainer);

    // Infinite scrolling logic

    const tweetsPagination = new TweetsPagination();

    // end of tweets message 
    const endText = document.createElement('p')
    endText.className = "end-text";
    endText.textContent = 'No more tweets';
    endText.style.display = 'none';
    middleComponent.appendChild(endText)
    
    middleComponent.addEventListener('scroll', () => {
        // Check if the user has scrolled to the bottom of the middle component
        if (middleComponent.scrollTop + middleComponent.clientHeight >= middleComponent.scrollHeight) {
            console.log('Bottom of middle-component reached');
            
            tweetsPagination.fetchNext().then(newTweets => {
                if (newTweets.length > 0) {
                    // Render the new tweets into tweetsContainer
                    renderTweets(newTweets, tweetsContainer, true); // 'true' means append to existing content
                } else {
                    console.log("No more tweets to load.");
                    endText.style.display = "block";
                }
            }).catch(error => {
                console.error("Error fetching more tweets:", error);
            });
        }
    });

    
    



    // TODO profile information seportator

    getUserData().then(userData => {
        
        // create tweet info
        const profilePicContainer = document.createElement('div');
        profilePicContainer.classList.add('profile-pic-container'); 
        
        const profilePicElement = document.createElement('img');
        profilePicElement.src = userData.profilePicture;
        profilePicElement.alt = 'Profile Picture';
       
        profilePicContainer.appendChild(profilePicElement);
        tweetFormComponent.prepend(profilePicContainer); // Prepend the container to the tweet form background
        
        // tab profile info

        const  profileInfoPicContainer = document.createElement('div');
        profileInfoPicContainer.className = 'profile-info-pic-div';

        profileInfoPicContainer.addEventListener('click', () => {
            profilePageSwitch.click()
        })

        const profileInfoPic = document.createElement('img')
        profileInfoPic.src = userData.profilePicture;
        profileInfoPic.alt = 'Profile Picture';
        profileInfoPicContainer.appendChild(profileInfoPic)

        
        const profileInfoTabContainer = document.createElement('div');
        profileInfoTabContainer.className = 'profile-info';
        const profileTabName = document.createElement('h1')
        profileTabName.textContent = userData.name
        const profileTabUser = document.createElement('p')
        profileTabUser.textContent = `@${userData.username}`
        profileInfoTabContainer.appendChild(profileTabName)
        profileInfoTabContainer.appendChild(profileTabUser)

        // Logout Button
        const logoutButton = stateButton('logout', 'logout-button');
        logoutButton.textContent = "";
        const logoutImage = document.createElement('img')
        logoutImage.alt = "logout";
        logoutImage.src = '../assets/logout.svg';
        logoutImage.className = 'tab-icon logout-icon';

        logoutButton.appendChild(logoutImage);
        
        tabProfileInfo.appendChild(profileInfoPicContainer)
        tabProfileInfo.appendChild(profileInfoTabContainer)
        tabProfileInfo.appendChild(logoutButton);


    
    }).catch(error => console.error("Error fetching user data:", error));

    // Initial fetch and display of tweets

    tweetsPagination.fetchNext(true).then(initialTweets => {
        renderTweets(initialTweets, tweetsContainer, false);
    }).catch(error => {
        console.error("Error during initial tweet fetch:", error);
    });
    
    //automatically go to the profile
    //profilePageSwitch.click()

 return homeComponent
}

function createButton(text, id) {
    const button = document.createElement('button');
    button.textContent = text;
    button.id = id;

    return button;
}


export { createHomeComponent };
