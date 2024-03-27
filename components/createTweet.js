// imports 
import { getFirestore, collection, addDoc, doc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";
import AppState from './state.js'; // Adjust the import path as needed
import { renderTweets } from './createFeed.js'; // Adjust import path as needed


async function refreshTweets() {
    const fetchedTweets = await fetchTweetsFromFollowing()
    console.log(fetchedTweets)
    return fetchedTweets
}



async function createTweet(content, imageFile) {
    const dbFirestore = getFirestore(); // Firestore instance
    const storage = getStorage(); // Firebase Storage instance
    const userId = AppState.getState().user.uid; 

    // Fetch the user's data from Firestore
    const userRef = doc(dbFirestore, "users", userId);
    const userSnap = await getDoc(userRef);
    let username = "", name = "";
    if (userSnap.exists()) {
        const userData = userSnap.data();
        username = userData.username;
        name = userData.name || userData.username;
    } else {
        console.error("User not found");
        return;
    }

    let imageUrl = "";
    if (imageFile) {
        const imageRef = storageRef(storage, `tweets/${userId}/${imageFile.name}`);
        const uploadResult = await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
    }

    // Prepare the new tweet document
    const newTweet = {
        userId,
        username,
        name,
        content,
        timestamp: serverTimestamp(), // Firestore server timestamp
        likes: [], // Assuming you want to start with 0 likes
        imageUrl, // Include the imageUrl in the tweet document
    };

    // Add the new tweet to the "tweets" collection in Firestore
    try {
        await addDoc(collection(dbFirestore, 'tweets'), newTweet);
        console.log('Tweet created successfully.');
        // Optionally, refresh tweets or perform any follow-up actions here
    } catch (error) {
        console.error('Failed to create tweet:', error);
    }
}


// Adjust the createTweetForm function to accept the refreshCallback argument
function createTweetForm(parentContainer) {
    const formContainer = document.createElement('div');
    formContainer.classList.add('tweet-form-container');

    const tweetForm = document.createElement('form');
    const createTweetInput = document.createElement('textarea');
    createTweetInput.placeholder = "What's happening?";

    const attachImageButton = document.createElement('img');
    attachImageButton.src = "../assets/gallery.svg";
    attachImageButton.textContent = 'Attach Image';
    attachImageButton.type = 'button'; // Set type to button

    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*'; // Accept images only
    imageInput.id = 'tweetImage';
    imageInput.style.display = 'none'; // Hide the file input

    // Create an image element for preview
    const imagePreview = document.createElement('img');
    imagePreview.id = 'imagePreview';
    imagePreview.style.display = 'none'; // Initially hide the preview

    const tweetSubmitButton = document.createElement('button');
    tweetSubmitButton.type = 'submit';
    tweetSubmitButton.textContent = 'Tweet';
    tweetSubmitButton.style.display = "none";

    // Create an image element for the submit button
    const tweetSubmitImage = document.createElement('img');
    tweetSubmitImage.src = '../assets/send1.svg';
    tweetSubmitImage.classList.add('tweet-submit-image');

    // Open file input when attachImageButton is clicked
    attachImageButton.addEventListener('click', function() {
        imageInput.click(); // Trigger click event on file input
    });

    const formInputContainer = document.createElement('div');
    formInputContainer.className = "form-input-container"
    formInputContainer.appendChild(createTweetInput);
    formInputContainer.appendChild(attachImageButton); // Attach image button
    formInputContainer.appendChild(imageInput);
    formInputContainer.appendChild(tweetSubmitButton);
    formInputContainer.appendChild(tweetSubmitImage); // Use an image as a submit button

    tweetForm.appendChild(formInputContainer)
    formContainer.appendChild(tweetForm);

    // Listen for changes in the file input to update the image preview
    imageInput.addEventListener('change', function() {
        const [file] = imageInput.files;
        if (file) {
            imagePreview.src = URL.createObjectURL(file);
            imagePreview.style.display = 'block'; // Show the preview
            imagePreview.style.height = '45px';
            imagePreview.style.width = '45px';
            imagePreview.style.margin = "0px 0 0px 10px";
            formInputContainer.insertBefore(imagePreview, formInputContainer.firstChild); // Insert at the beginning
        } else {
            imagePreview.style.display = 'none'; // Hide the preview if no file is selected
        }
    });

    tweetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const tweetContent = createTweetInput.value.trim();
        const imageFile = imageInput.files[0]; // Get the first (and only) file
        if (tweetContent || imageFile) {
            await createTweet(tweetContent, imageFile); // Await the tweet creation
            createTweetInput.value = ''; // Clear the input
            imageInput.value = ''; // Clear the file input
            imagePreview.src = ''; // Clear the image preview
            imagePreview.style.display = 'none'; // Hide the preview
            // Optionally, call a function to refresh the tweets display
        }
    });

    tweetSubmitImage.addEventListener('click', () => tweetSubmitButton.click()); // Programmatically click the hidden submit button

    return formContainer;
}







export { createTweet, createTweetForm, refreshTweets };
