import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref as storageRef, uploadBytes, deleteObject, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";


export function showEditTweetModal(tweetId, currentContent, currentImageUrl) {
    
    //main containers
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';

    const modalBackground = document.createElement('div');
    modalBackground.className = 'modal-background-edit';

    const form = document.createElement('form');
    form.className = 'edit-tweet-form';

    // navigation
    const editTweetNav = document.createElement('div');
    editTweetNav.className = 'edit-tweet-nav';
    
    const rightNavDiv = document.createElement('div');
    rightNavDiv.className = 'right-nav-div';
    const leftNavDiv  = document.createElement('div');
    leftNavDiv.className = 'left-nav-div';

    editTweetNav.append(leftNavDiv, rightNavDiv )

    const editTweetHeader = document.createElement('div');
    editTweetHeader.className = "edit-tweet-header";
    editTweetHeader.textContent = "Edit Tweet";
    
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
    saveButton.textContent = 'Save';
    saveButton.type = 'button';
    

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
    textarea.value = currentContent;

    textareaContainer.append(textareaLabel, textarea);    
    form.appendChild(textareaContainer);

    // image container
    const editTweetImgDiv = document.createElement('div');
    editTweetImgDiv.className = 'edit-tweet-img-div';


    // Display current image if exists
    let imagePreview;
    if (currentImageUrl) {
        imagePreview = document.createElement('img');
        imagePreview.src = currentImageUrl;
        imagePreview.className = 'edit-image-preview';
        editTweetImgDiv.appendChild(imagePreview)
        form.appendChild(editTweetImgDiv)
      
    }


    // image input
    const imageInputContainer = document.createElement('div');
    imageInputContainer.className = 'image-input-container';

    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';
    imageInput.style.display = 'none'; // Hide the input element

    const imageButton = document.createElement('button');
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
            if (imagePreview) {
                imagePreview.src = imageUrl;
            } else {
                imagePreview = document.createElement('img');
                imagePreview.src = imageUrl;
                imagePreview.className = 'edit-image-preview';
                editTweetImgDiv.appendChild(imagePreview);
            }
            removeImageButton.style.display = 'inline-block'; // Show the Remove Image button
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
    if (!currentImageUrl) {
        removeImageButton.style.display = 'none'; // Hide the button if there's no image
    }
    
    imageInputContainer.appendChild(removeImageButton);

    

    modalBackground.appendChild(form);
    modalContainer.appendChild(modalBackground)
    document.body.appendChild(modalContainer);

    // Track whether the user intends to remove the image
    let intendsToRemoveImage = false;

    saveButton.addEventListener('click', async () => {
        const newContent = textarea.value.trim();
        const dbFirestore = getFirestore();
        const tweetDocRef = doc(dbFirestore, `tweets/${tweetId}`);
        const updates = { content: newContent };
    
        // Check if an image file was selected for upload
        if (imageInput.files.length > 0) {
            const imageFile = imageInput.files[0];
            const imageRef = storageRef(getStorage(), `tweet_images/${tweetId}/${imageFile.name}`);
            const uploadResult = await uploadBytes(imageRef, imageFile);
            const newImageUrl = await getDownloadURL(uploadResult.ref);
            updates.imageUrl = newImageUrl;
    
            // Update the image preview
            if (imagePreview) {
                imagePreview.src = newImageUrl;
            } else {
                imagePreview = document.createElement('img');
                imagePreview.src = newImageUrl;
                imagePreview.className = 'edit-image-preview';
                editTweetImgDiv.appendChild(imagePreview);
            }
        } else if (intendsToRemoveImage) {
            updates.imageUrl = ""; // remove the image URL if intended
            // Optionally, delete the image from Firebase Storage here if needed
            if (imagePreview) {
                imagePreview.remove(); // Remove the image preview from the form
                imagePreview = null; // Reset imagePreview variable
            }
        }
    
        await updateDoc(tweetDocRef, updates);
        modalContainer.remove(); // Close the modal after saving
    });
    

    removeImageButton.addEventListener('click', () => {
        intendsToRemoveImage = true; // Indicate intention to remove the image
        if (imagePreview) {
            imagePreview.remove(); // Remove the image preview from the form
            imagePreview = null; // Reset imagePreview variable
        }
        removeImageButton.style.display = 'none'; // Optionally hide the button after clicking
        // Optionally, reset the input value to allow re-upload of the same image
        imageInput.value = null;
        // Show the image input button again
        imageButton.style.display = 'inline-block';
    });
    

    cancelButton.addEventListener('click', () => {
        modalContainer.remove(); // Close the modal without saving
    });
}
