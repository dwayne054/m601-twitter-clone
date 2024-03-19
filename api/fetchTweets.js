import {  getDatabase, ref, get, query, orderByChild, equalTo  } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";


import { getUserData } from "./userData.js";

async function fetchTweetsFromFollowing() {
    const db = getDatabase();
    // Fetch all tweets regardless of following status
    const tweetsRef = ref(db, 'tweets');

    try {
        const tweetsSnapshot = await get(tweetsRef);
        if (!tweetsSnapshot.exists()) {
            console.log('No tweets found.');
            return [];
        }

        let tweets = [];
        tweetsSnapshot.forEach(tweetSnapshot => {
            const tweetKey = tweetSnapshot.key;
            const tweetData = tweetSnapshot.val();
            // Assuming tweetData structure includes userId, username, content, likes
            tweets.push({
                id: tweetKey,
                uid: tweetData.userId,
                username: tweetData.username, // The user who posted it
                content: tweetData.content, // The content of the tweet
                likes: tweetData.likes, // Number of likes
                timestamp: tweetData.timestamp
            });
        });

        return tweets;
    } catch (error) {
        console.error("Failed to fetch tweets:", error);
        return [];
    }
}

async function fetchUserTweets(userId) {
    const db = getDatabase();
    const tweetsRef = query(ref(db, 'tweets'), orderByChild('userId'), equalTo(userId));

    try {
        const tweetsSnapshot = await get(tweetsRef);
        if (!tweetsSnapshot.exists()) {
            console.log('No tweets found for this user.');
            return [];
        }

        let tweets = [];
        tweetsSnapshot.forEach(tweetSnapshot => {
            const tweetKey = tweetSnapshot.key;
            const tweetData = tweetSnapshot.val();
            tweets.push({
                id: tweetKey,
                username: tweetData.username, // The user who posted it
                content: tweetData.content, // The content of the tweet
                likes: tweetData.likes // Number of likes
            });
        });

        return tweets;
    } catch (error) {
        console.error("Failed to fetch user's tweets:", error);
        return [];
    }
}

export { fetchTweetsFromFollowing , fetchUserTweets};
