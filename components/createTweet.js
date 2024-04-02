// imports 
import { getFirestore, collection, addDoc, doc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";
import AppState from './state.js'; // Adjust the import path as needed

import { showAlert } from "../app.js";




function createModalTweetForm() {
    // Main containers
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';

    const modalBackground = document.createElement('div');
    modalBackground.className = 'modal-background-edit';

    const form = document.createElement('form');
    form.className = 'edit-tweet-form';

    // Navigation
    const editTweetNav = document.createElement('div');
    editTweetNav.className = 'edit-tweet-nav';
    
    const rightNavDiv = document.createElement('div');
    rightNavDiv.className = 'right-nav-div';
    const leftNavDiv  = document.createElement('div');
    leftNavDiv.className = 'left-nav-div';

    editTweetNav.append(leftNavDiv, rightNavDiv )

    const editTweetHeader = document.createElement('div');
    editTweetHeader.className = "edit-tweet-header";
    editTweetHeader.textContent = "Post Tweet";
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '';
    cancelButton.type = 'button';
    const cancelButtonImg = document.createElement('img');
    cancelButtonImg.src = '../../assets/x-cross-black.svg'
    cancelButtonImg.className = 'cancel-edit-img';
    cancelButton.appendChild(cancelButtonImg)
    editTweetNav.appendChild(cancelButton);
    
    leftNavDiv.append(cancelButton, editTweetHeader)
    
    const saveButton = document.createElement('button');
    saveButton.textContent = 'Upload';
    saveButton.className = 'upload-button-modal';
    saveButton.type = 'button';
    saveButton.backgroundColor = "#657786";
    saveButton.disabled = true; // Disable button by default

    rightNavDiv.append(saveButton)

    form.appendChild(editTweetNav)
    
    const textareaContainer = document.createElement('div');
    textareaContainer.className = 'text-area-container';

    const textareaLabel = document.createElement('label');
    textareaLabel.className = 'text-area-label';
    textareaLabel.textContent = 'Post Text';
    textareaLabel.setAttribute('for', 'edit-tweet-textarea'); // Associate label with input

    const textarea = document.createElement('input');
    textarea.id = 'edit-tweet-textarea'; // Assign an id to the input
    textarea.className = 'edit-tweet-textarea';
    textarea.placeholder = "What's happening?";
    textarea.addEventListener('input', () => {
        // Enable or disable saveButton based on textarea value
        if (!textarea.value.trim() && !imageInput.files[0]) {
            saveButton.disabled = true;
            saveButton.style.backgroundColor = "";
            saveButton.style.color = "";

        } else {
            saveButton.disabled = false;
            saveButton.style.backgroundColor = "#1DA1F2";
            saveButton.style.color = "#FFFFFF"
            saveButton.style.cursor = "pointer";

        }
        

    });

    textareaContainer.append(textareaLabel, textarea);    
    form.appendChild(textareaContainer);

    // Image container
    const editTweetImgDiv = document.createElement('div');
    editTweetImgDiv.className = 'edit-tweet-img-div';
    editTweetImgDiv.style.display = 'none';

    const imageInputContainer = document.createElement('div');
    imageInputContainer.className = 'image-input-container';

    form.appendChild(editTweetImgDiv)

    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';
    imageInput.style.display = 'none'; // Hide the input element

    const imageButton = document.createElement('button');
    imageButton.className = "upload-image-button"
    imageButton.textContent = 'Upload Image';
    imageButton.type = 'button'; // Set type to button to prevent form submission
    imageButton.onclick = function() {
        imageInput.click(); // Trigger click event of input when button is clicked
    };

    imageInput.addEventListener('change', () => {
        const file = imageInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
            const imageUrl = event.target.result;
            const imagePreview = document.createElement('img');
            imagePreview.src = imageUrl;
            imagePreview.className = 'edit-image-preview';
            while (editTweetImgDiv.firstChild) {
                editTweetImgDiv.removeChild(editTweetImgDiv.firstChild);
            }
            editTweetImgDiv.appendChild(imagePreview);
            editTweetImgDiv.style.display = 'flex';

            removeImageButton.style.display = 'inline-block'; // Show the Remove Image button
            saveButton.disabled = !textarea.value.trim() && !imageInput.files[0]; // Enable or disable saveButton based on textarea and imageInput value
          
       
            saveButton.disabled = false;
            saveButton.style.backgroundColor = "#1DA1F2";
            saveButton.style.color = "#FFFFFF"
            saveButton.style.cursor = "pointer";

        
        };
        
        if (file) {
            reader.readAsDataURL(file);
        }
    });

    imageInputContainer.appendChild(imageInput);
    imageInputContainer.appendChild(imageButton);

    form.appendChild(imageInputContainer);

    // Remove Image Button
    const removeImageButton = document.createElement('button');
    removeImageButton.textContent = 'Remove Image';
    removeImageButton.id = 'remove-image-button';
    removeImageButton.type = 'button';
    removeImageButton.style.display = 'none'; // Hide the button initially

    imageInputContainer.appendChild(removeImageButton);

    modalBackground.appendChild(form);
    modalContainer.appendChild(modalBackground)
    document.body.appendChild(modalContainer);

    // Track whether the user intends to remove the image
    let intendsToRemoveImage = false;

    saveButton.addEventListener('click', async () => {
        const newContent = textarea.value.trim();
        const imageFile = imageInput.files[0];

        // Disable the save button while posting
        saveButton.disabled = true;

        // Call createTweet function to create the tweet
        await createTweet(newContent, imageFile);

        // Close the modal after posting
        modalContainer.remove();

        const homeTab = document.querySelector('#home-button')
        homeTab.click()

        showAlert(' Tweet successfully created')
        


    });

    // Add event listener to enable/disable the save button when typing or uploading an image
    const handleInput = () => {
        saveButton.disabled = !textarea.value.trim() && !imageInput.files[0];
    };

    textarea.addEventListener('input', handleInput);
    imageInput.addEventListener('change', handleInput);

    removeImageButton.addEventListener('click', () => {
        intendsToRemoveImage = true; // Indicate intention to remove the image
        while (editTweetImgDiv.firstChild) {
            editTweetImgDiv.removeChild(editTweetImgDiv.firstChild);
        }
        removeImageButton.style.display = 'none'; // Hide the Remove Image button
        imageInput.value = ''; // Clear the file input
        saveButton.disabled = !textarea.value.trim() && !imageInput.files[0]; // Enable or disable saveButton based on textarea and imageInput value
      

        if (!textarea.value.trim() && !imageInput.files[0]) {
            saveButton.disabled = true;
            saveButton.style.backgroundColor = "";
            saveButton.style.color = "";
            saveButton.style.cursor = "";

        } else {
            saveButton.disabled = false;
            saveButton.style.backgroundColor = "#1DA1F2";
            saveButton.style.color = "#FFFFFF"
            saveButton.style.cursor = "pointer";

        }


    });

    cancelButton.addEventListener('click', () => {
        modalContainer.remove(); // Close the modal without posting
    });
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
function createTweetForm(parentContainer, refreshCallback) {
    const formContainer = document.createElement('div');
    formContainer.classList.add('tweet-form-container');

    const tweetForm = document.createElement('form');
    const createTweetInput = document.createElement('textarea');
    createTweetInput.placeholder = "What's happening?";

    // button container 
    const formButtonContainer = document.createElement('div');
    formButtonContainer.className = 'form-button-container';

    const attachImageButton = document.createElement('img');
    attachImageButton.className = 'attach-image-button';
    attachImageButton.src = "../assets/gallery.svg";
    attachImageButton.textContent = 'Attach Image';
    attachImageButton.type = 'button'; // Set type to button

    attachImageButton.addEventListener('mouseenter', () => {
        // Change the image source on hover
        attachImageButton.src = "../assets/galleryfil.svg";
    });
    
    attachImageButton.addEventListener('mouseleave', () => {
        // Restore the original image source when mouse leaves
        attachImageButton.src = "../assets/gallery.svg";
    });

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
    tweetSubmitImage.src = '../assets/send2.svg';
    tweetSubmitImage.classList.add('tweet-submit-image');

    // Open file input when attachImageButton is clicked
    attachImageButton.addEventListener('click', function() {
        imageInput.click(); // Trigger click event on file input
    });

    const formInputContainer = document.createElement('div');
    formInputContainer.className = "form-input-container"
    formInputContainer.appendChild(createTweetInput);
    formInputContainer.appendChild(formButtonContainer)
    formButtonContainer.appendChild(attachImageButton); // Attach image button
    formButtonContainer.appendChild(imageInput);
    formButtonContainer.appendChild(tweetSubmitButton);
    formButtonContainer.appendChild(tweetSubmitImage); // Use an image as a submit button
    tweetForm.appendChild(formInputContainer)
    formContainer.appendChild(tweetForm);

    // Listen for changes in the file input to update the image preview
    // Listen for changes in the file input to update the image preview and submit button image
    imageInput.addEventListener('change', function() {
        const [file] = imageInput.files;
        if (file) {
            imagePreview.src = URL.createObjectURL(file);
            imagePreview.style.display = 'block'; // Show the preview
            imagePreview.style.height = '45px';
            imagePreview.style.width = '45px';
            imagePreview.style.margin = "0px 0 0px 10px";
            formInputContainer.insertBefore(imagePreview, formInputContainer.firstChild); // Insert at the beginning
            
            // Change the image source of the submit button when there is an image
            tweetSubmitImage.src = '../assets/send2fill.svg';
        } else {
            imagePreview.style.display = 'none'; // Hide the preview if no file is selected
            
            // Change the image source of the submit button back to the original image
            tweetSubmitImage.src = '../assets/send2.svg';
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
            const homeTab = document.querySelector('#home-button')
            homeTab.click()
            showAlert(' Tweet successfully created')
        }
    });

    createTweetInput.addEventListener('input', () => {
        const tweetContent = createTweetInput.value.trim();
        if (tweetContent.length > 0) {
            // Change the image source to a different image when content is typed
            tweetSubmitImage.src = '../assets/send2fill.svg';
            // Show the submit button
           
        } else {
            // Change the image source back to the original image
            tweetSubmitImage.src = '../assets/send2.svg';
            // Hide the submit button if there is no content
            tweetSubmitButton.style.display = 'none';
        }
    });

    
    
    tweetSubmitImage.addEventListener('click', () => tweetSubmitButton.click()); // Programmatically click the hidden submit button
    
   
    
    return formContainer;
}







export { createTweet, createTweetForm,  createModalTweetForm };
