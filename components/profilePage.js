import AppState from "./state.js";
import { fetchUserTweets } from "../api/fetchTweets.js"; // Assuming fetchUserTweets is the adjusted function
import { getUserData } from "../api/userData.js";
import { formatTweetDate } from "./createFeed.js";
import { showProfileEditModal } from './editProfile.js';
import { showDeleteTweetModal } from "./tweetEdit/deleteTweetModal.js";
import { showEditTweetModal } from "./tweetEdit/editTweetModal.js";

function profilePage() {
    
    // main container
    const profileContainer = document.createElement('div');
    profileContainer.className = 'profile-container';

    // navigation at the top of the profile page
    const navContainer = document.createElement('div');
    navContainer.className = 'nav-container-profile-page';

    // back button
    const backButtonNav = document.createElement('button');
    backButtonNav.className = "back-button-nav";
    const backButtonImg = document.createElement('img');
    backButtonImg.className = 'back-button-img';
    backButtonImg.src = '../assets/arrow-left.svg';
    backButtonImg.alt = 'back-to-home';
    backButtonNav.append(backButtonImg)
    
    // go back to home if the back is clicked on
    backButtonNav.addEventListener('click', ()=> {
        let homeButton = document.querySelector('#home-button');
        homeButton.click()
        
    })
    
    // tweet count and user 
    const profileNavContext = document.createElement('div')
    profileNavContext.className = "profile-nav-context";
    const displayNameNav = document.createElement('h1')
    displayNameNav.textContent = "loading..."
    const tweetCount = document.createElement('p');
    tweetCount.textContent = 'loading...'
    profileNavContext.append(displayNameNav, tweetCount)

    navContainer.append(backButtonNav, profileNavContext )

    //creating the top of the profilepage with the background and user info
    const profileHeaderDiv = document.createElement('div');
    profileHeaderDiv.className = 'profile-header-div';

    // blue background
    const userBackground = document.createElement('div');
    userBackground.className = "user-background";
    profileHeaderDiv.appendChild(userBackground);


    //profile header content
    const profileContent = document.createElement('div');
    profileContent.className = "profile-content";
    
    //  edit profile button
    const editProfileContainer = document.createElement('div')
    editProfileContainer.className = "edit-profile-container";
    const editProfileButton = document.createElement('button');
    editProfileButton.textContent = "Edit Profile";
    editProfileButton.className = "edit-profile-button";
    editProfileContainer.appendChild(editProfileButton);


    editProfileButton.addEventListener('click', async () => {
        const userData = await getUserData();
        const profileLinkButton = document.getElementById("home-button")
        showProfileEditModal(userData, profileLinkButton);
    });
    




    // namimg element container
    const nameContainer = document.createElement('div')
    nameContainer.className = 'name-container'; 

    const displayNameElement = document.createElement('h1');
    displayNameElement.textContent = "Loading name...";
    
    const userNameElement = document.createElement('p');
    userNameElement.textContent = "Loading username...";

    nameContainer.append(displayNameElement, userNameElement)

    // profile picture 

    const profilePicElement = document.createElement('img');
    profilePicElement.src = ""; // Adjust path as needed
    profilePicElement.alt = 'Profile Picture';
    profilePicElement.className = "profile-pic-header";


    // description container 
    const descriptionContainer = document.createElement('div');
    descriptionContainer.className = 'description-div';
    const descriptionText = document.createElement('p');
    descriptionText.className = 'description-text';
    descriptionText.textContent = 'loading...';
    descriptionContainer.appendChild(descriptionText)

    
    profileContainer.append(navContainer, profileHeaderDiv, profileContent)
    profileContent.append(profilePicElement, editProfileContainer, nameContainer, descriptionContainer );

   // Followers and Following placeholders
    const countDiv = document.createElement('div');
    countDiv.className = 'count-div';

    //followers div
    const followersDiv = document.createElement('div');
    followersDiv.className = 'follow-div';

    // Followers count
    const followersCountElement = document.createElement('h1');
    followersCountElement.textContent = "Loading...";
    const followersTextElement = document.createElement('p');
    followersTextElement.textContent = "Followers";
    followersDiv.append(followersCountElement, followersTextElement)

    //following div
    const followingDiv = document.createElement('div');
    followingDiv.className = 'follow-div';
    
    // Following count
    const followingCountElement = document.createElement('h1');
    followingCountElement.textContent = "Loading...";
    const followingTextElement = document.createElement('p');
    followingTextElement.textContent = "Following";
    followingDiv.append(followingCountElement, followingTextElement)

    countDiv.append(followingDiv, followersDiv);
    

    profileContent.appendChild(countDiv); 

    getUserData().then(userData => {
        
        displayNameNav.textContent = userData.name
        displayNameElement.textContent = userData.name;
        userNameElement.textContent = `@${userData.username}`;
        profilePicElement.src = userData.profilePicture;
        followersCountElement.textContent = `${userData.followers?.length || 0}`;
        followersTextElement.textContent = " Followers";
        followingCountElement.textContent = ` ${userData.following?.length || 0}`;
        followingTextElement.textContent = " Following";
        if (userData.description === "") {
            profileContainer.display = 'none';
            descriptionText.textContent ='';
        } else {
            descriptionText.textContent = userData.description;
        }
    }).catch(error => console.error("Error fetching user data:", error));


    // Section to hold tweets
    const tweetsSection = document.createElement('div');
    tweetsSection.className = "tweets-container";
    profileContainer.appendChild(tweetsSection);

    // console.log(AppState.getState().user.uid)

    fetchUserTweets(AppState.getState().user.uid).then(userTweets => {
        updateTweetsSection(tweetsSection, userTweets, tweetCount);
    });

   

    return profileContainer;
}



// Function to update tweets section on the profile page
function updateTweetsSection(container, userTweets, tweetCountElement) {
 
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    
    // Check for an empty or undefined array of tweets
    if (!Array.isArray(userTweets) || userTweets.length === 0) {
        const noTweetsMessage = document.createElement('p');
        noTweetsMessage.className = 'no-tweets-message';
        noTweetsMessage.textContent = 'No tweets found.';
        container.appendChild(noTweetsMessage);
        tweetCountElement.textContent = `0 Posts`;

        return;
    }

    // Sort tweets by timestamp in descending order
    userTweets.sort((a, b) => b.timestamp - a.timestamp);

    let totalTweetCount = 0


    
    userTweets.forEach(tweet => {
        //console.log(tweet)
        
        totalTweetCount ++;
        
        // Creating the main tweet element
        const tweetElement = document.createElement('div');
        tweetElement.className = 'tweet';
        
        // User profile picture
        const profilePicContainer = document.createElement('div');
        profilePicContainer.className = "profile-pic-div";
        
        const profilePic = document.createElement('img');
        profilePic.src = tweet.profilePicture;
        profilePic.alt = `${tweet.username}'s profile picture`;
        profilePic.className = 'profile-pic';
        
        profilePicContainer.appendChild(profilePic)
        
        // content container 
        const contentDiv = document.createElement('div');
        contentDiv.classList.add('content-div');
        
        // top section of the post
        const postInfo = document.createElement('div');
        postInfo.classList.add('post-info-user-tweet');

        // left section of tweet header
        const postInfoLeft = document.createElement('div');
        postInfoLeft.className = 'post-info post-info-tweet';
        
        // User display name and username
        const displayName = document.createElement('h1');
        displayName.textContent = tweet.name;
        const username = document.createElement('p');
        username.textContent = `@${tweet.username}`;
        
        // Tweet content
        const content = document.createElement('p');
        content.className = 'tweet-content';
        content.textContent = tweet.content;
        
        // Timestamp
        const timestamp = document.createElement('p');
        timestamp.textContent = formatTweetDate(tweet.timestamp);
        
        // rigth section that has the edit feature
        const postInfoRight = document.createElement('div');
        postInfoRight.className = 'post-info-right';

        const optionsButton = document.createElement('button');
        optionsButton.className = "option-tweet-button";
        optionsButton.textContent = ""
        const optionsImg = document.createElement('img');
        optionsImg.className = 'options-image';
        optionsImg.src = '../assets/options.svg';
        optionsButton.appendChild(optionsImg);
        postInfoRight.appendChild(optionsButton)


        // menu pop up when the option button is clicked
        const optionPopupContainer = document.createElement('div');
        optionPopupContainer.className = "option-popup-container";
        optionPopupContainer.style.display = 'none';

        // delete button
        const tweetDeleteDiv = document.createElement('div');
        tweetDeleteDiv.className = 'tweet-delete-div';
        const tweetDeleteButton = document.createElement('button')
        tweetDeleteButton.textContent = '';
        tweetDeleteButton.className = 'tweet-delete-button tweet-option-button ';
        const tweetDeleteTextDiv = document.createElement('div');
        tweetDeleteTextDiv.className = "tweet-text-option-div";
        const tweetDeleteText = document.createElement('p');
        tweetDeleteText.textContent = "Delete";
        tweetDeleteTextDiv.appendChild(tweetDeleteText)
        const tweetDeleteImageDiv = document.createElement('div');
        tweetDeleteImageDiv.className = "tweet-img-option-div";
        const tweetDeleteImage = document.createElement('img');
        tweetDeleteImage.src = '../assets/trash1.svg';
        tweetDeleteImage.className = 'tweet-edit-img';
        tweetDeleteImageDiv.appendChild(tweetDeleteImage)
        
        // appending delete button and container
        tweetDeleteButton.append(tweetDeleteImageDiv, tweetDeleteTextDiv)
        tweetDeleteDiv.appendChild(tweetDeleteButton)
        
        // edit button 
        const tweetEditDiv = document.createElement('div');
        tweetEditDiv.className = "tweet-edit-div";
        const tweetEditButton = document.createElement('button');
        tweetEditButton.textContent = ""
        tweetEditButton.className = 'tweet-edit-button tweet-option-button ';
        const tweetEditTextDiv = document.createElement('div');
        tweetEditTextDiv.className = "tweet-text-option-div";
        const tweetEditText = document.createElement('p');
        tweetEditText.textContent = "Edit Tweet"
        tweetEditTextDiv.appendChild(tweetEditText)
        const tweetEditImageDiv = document.createElement('div');
        tweetEditImageDiv.className = "tweet-img-option-div";
        const tweetEditImage = document.createElement('img')
        tweetEditImage.className = 'tweet-edit-img';
        tweetEditImage.src = '../assets/pencil1.svg';
        tweetEditImageDiv.appendChild(tweetEditImage)

        // Edit tweet action
        tweetEditButton.addEventListener('click', () => {
            // Close the options popup
            togglePopupDisplay();
            // Call the edit tweet modal function
    
            showEditTweetModal(tweet.id, content.textContent,tweet.imageUrl );
            
            
        });

        // Delete tweet action
        tweetDeleteButton.addEventListener('click', () => {
            // Close the options popup
            togglePopupDisplay();
            // Call the delete tweet modal function
            showDeleteTweetModal(tweet.id);
           
            
        });

        // appendign edit button and container
        tweetEditButton.append(tweetEditImageDiv, tweetEditTextDiv)
        tweetEditDiv.appendChild(tweetEditButton)

        //  appending buttons
        optionPopupContainer.append(tweetDeleteDiv, tweetEditDiv)


        // option action 

        // Function to toggle the display of the popup
        const togglePopupDisplay = () => {
            optionPopupContainer.style.display = (optionPopupContainer.style.display === 'none' ? 'block' : 'none');
        };

        // Show the popup when the options button is clicked
        optionsButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent this click from being considered an 'outside' click
            togglePopupDisplay();
        });

        // Hide the popup when clicking outside of it
        document.addEventListener('click', (event) => {
            if (!optionPopupContainer.contains(event.target) && optionPopupContainer.style.display === 'block') {
                togglePopupDisplay();
            }
        });

        postInfoRight.appendChild(optionPopupContainer)
        
        postInfo.append(postInfoLeft, postInfoRight)
        postInfoLeft.append(displayName, username, timestamp)
        
        
        contentDiv.append(postInfo, content);
        
        // Image in tweet (if present)
        if (tweet.imageUrl) {
            const tweetImage = document.createElement('img');
            tweetImage.src = tweet.imageUrl;
            tweetImage.alt = 'Tweet image';
            tweetImage.className = 'tweet-image';
            contentDiv.appendChild(tweetImage); // Append the image to tweetElement directly
        }
        
        
        // Append all elements to tweetElement
        tweetElement.append(profilePicContainer, contentDiv);
    

        // Assuming deleteButton is your delete button for a tweet
        /*
        deleteButton.onclick = (event) => {
            event.preventDefault(); // Prevent any default action
            // Assuming tweetElement is the DOM element of the tweet
            removeTweet(tweet.id, container, contentDiv);
        };
        */
       
        // Append tweetElement to the container
        container.appendChild(tweetElement);

        // for the tweet count in the nav
        tweetCountElement.textContent = `${totalTweetCount} Posts`;
        
        
    });
}






export { profilePage, updateTweetsSection};
