# Twitter Clone Application

## Overview
This is a Twitter clone application built with HTML, CSS, and JavaScript. It provides basic functionalities such as posting tweets, viewing the home feed, and viewing user profiles.

## Setup
To run the application, simply download the files and open the `index.html` file in a web browser. Alternatively, you can use a live server extension in your code editor to launch the application.

## Functionality
- **Home Page**: Displays the user's home feed with infinite scrolling to load more tweets as the user scrolls down.
- **Profile Page**: Shows the user's profile information, including their tweets and follower/following counts.
- **Tweeting**: Users can compose and post tweets using the tweet button on the home page.
- **Tweet Options**: Users can edit or delete their own tweets.
- **Profile Navigation**: Users can switch between the home feed and their profile page using the navigation tabs.
- **Logout**: Users can log out of their account.

## Assumptions/Considerations
- The application assumes that users are authenticated and logged in before accessing the home feed and profile page.
- Firebase is used as the backend database for storing user data and tweets.
- The application employs infinite scrolling to fetch more tweets as the user scrolls down the home feed.
- Basic error handling is implemented for fetching data and posting tweets.

## Firebase Setup (Optional)
If you wish to set up Firebase for this application, follow these steps:

1. Sign in to the [Firebase Console](https://console.firebase.google.com/).
2. Create a new Firebase project.
3. Set up Firebase Authentication to handle user authentication.
4. Set up Firebase Firestore as the database to store user data and tweets.
5. Obtain the necessary configuration settings for Firebase Authentication and Firestore.
6. Replace the Firebase configuration placeholders in the JavaScript files (`state.js` and `profilePage.js`) with your actual Firebase configuration.
7. Ensure that the Firebase JavaScript SDK is included in your project.

## Contributors
- [Ken Gibson ]

