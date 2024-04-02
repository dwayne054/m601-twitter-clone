import { getFirestore, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";
import AppState from "./state.js";
import { showAlert } from "../app.js";
import { showLogoutModal } from "./logoutModal.js";

export function showProfileEditModal(userData ,profileLink) {
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';

    const modalBackground = document.createElement('div');
    modalBackground.className = 'modal-background-edit';

    const form = document.createElement('form');
    form.className = 'edit-profile-form';

    // Navigation
    const editProfileNav = document.createElement('div');
    editProfileNav.className = 'edit-profile-nav';
    
    const rightNavDiv = document.createElement('div');
    rightNavDiv.className = 'right-nav-div';
    const leftNavDiv  = document.createElement('div');
    leftNavDiv.className = 'left-nav-div';

    editProfileNav.append(leftNavDiv, rightNavDiv );

    const editProfileHeader = document.createElement('div');
    editProfileHeader.className = "edit-profile-header";
    editProfileHeader.textContent = "Edit Profile";
    
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '';
    cancelButton.type = 'button';
    const cancelButtonImg = document.createElement('img');
    cancelButtonImg.src = '../../assets/x-cross-black.svg';
    cancelButtonImg.className = 'cancel-edit-img';
    cancelButton.appendChild(cancelButtonImg);
    editProfileNav.appendChild(cancelButton);
    
    leftNavDiv.append(cancelButton, editProfileHeader);

    const saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.className = "save-button-edit-modal"
    saveButton.type = 'button';
    rightNavDiv.appendChild(saveButton);

    form.appendChild(editProfileNav);

    // Current Profile Picture
    const currentProfilePic = document.createElement('img');
    currentProfilePic.src = userData.profilePicture;
    currentProfilePic.alt = 'Current Profile Picture';
    currentProfilePic.className = 'current-profile-pic';
    form.appendChild(currentProfilePic);

    // Profile Picture Upload Field
   
    const profilePicInput = document.createElement('input');
    profilePicInput.type = 'file';
    profilePicInput.accept = 'image/*';
    profilePicInput.style.display = 'none'; // Hide the input element

    form.appendChild(profilePicInput);

    const profilePicButton = document.createElement('button');
    profilePicButton.textContent = 'Upload Image';
    profilePicButton.className = 'upload-image-button-profile'
    profilePicButton.type = 'button'; // Set type to button to prevent form submission
    profilePicButton.onclick = function() {
        profilePicInput.click(); // Trigger click event of input when button is clicked
    };
    form.appendChild(profilePicButton);

    // Display Name Field
    const nameInputLabel = document.createElement('label');
    nameInputLabel.textContent = 'Name';
    nameInputLabel.className = 'edit-profile-label';
    const nameInput = createInputField('text', 'Full Name', userData.name);
    nameInputLabel.appendChild(nameInput);
    form.appendChild(nameInputLabel);
    
    /*
    // Username Field
    const usernameInputLabel = document.createElement('label');
    usernameInputLabel.textContent = 'Username:';
    usernameInputLabel.className = 'edit-profile-label';
    const usernameInput = createInputField('text', 'Username', userData.username);
    usernameInputLabel.appendChild(usernameInput);
    form.appendChild(usernameInputLabel);
    */

    // Description Field
    const descriptionInputLabel = document.createElement('label');
    descriptionInputLabel.textContent = 'Description';
    descriptionInputLabel.className = 'edit-profile-label';
    const descriptionInput = createInputField('text', 'Description', userData.description || '');
    descriptionInputLabel.appendChild(descriptionInput);
    form.appendChild(descriptionInputLabel);


    //Logout button
    const logoutEditProfile = document.createElement('button');
    logoutEditProfile.textContent = "logout";
    logoutEditProfile.className = 'logout-edit-profile';
    logoutEditProfile.addEventListener('click' , ()=> {
        modalContainer.remove()
        showLogoutModal()
    })
    form.appendChild(logoutEditProfile)



    modalBackground.appendChild(form);
    modalContainer.appendChild(modalBackground);
    document.body.appendChild(modalContainer);

    profilePicInput.addEventListener('change', async () => {
        const file = profilePicInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
            currentProfilePic.src = event.target.result;
        };
        
        if (file) {
            reader.readAsDataURL(file);
        }
    });

    

    saveButton.addEventListener('click', async () => {
        const db = getFirestore();
        const storage = getStorage();
        const userRef = doc(db, `users/${AppState.getState().user.uid}`);
        
        let profilePictureUrl = userData.profilePicture;
        if (profilePicInput.files.length > 0) {
            const file = profilePicInput.files[0];
            const storagePath = `profilePictures/${AppState.getState().user.uid}`;
            const imageRef = storageRef(storage, storagePath);
            const snapshot = await uploadBytes(imageRef, file);
            profilePictureUrl = await getDownloadURL(snapshot.ref);
        }
        
        const updatePayload = {
            name: nameInput.value.trim(),
            // username: usernameInput.value.trim(),
            description: descriptionInput.value.trim(),
            profilePicture: profilePictureUrl
        };
    
        await updateDoc(userRef, updatePayload);
        modalContainer.remove(); // Close the modal after saving
        const homeTab = document.querySelector('#home-button')
        homeTab.click()
        showAlert('Profile updated')
    });

    cancelButton.addEventListener('click', () => {
        modalContainer.remove(); // Close the modal without saving
    });

    function createInputField(type, placeholder, value = '') {
        const input = document.createElement('input');
        input.type = type;
        input.placeholder = placeholder;
        input.value = value;
        input.className = 'edit-input';
        return input; // Return the input element directly
    }
    
}
