import { auth } from "../api/firebase.js";
import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";
// Import Firestore functions
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { stateButton } from "./stateButton.js";
import AppState from "./state.js";
import { dbFirestore } from "../api/firebase.js";

function createUserComponent() {
    
    
    const form = document.createElement('form');
    form.className = "login-form";
    
    const profilePicPlaceholder = document.createElement('img'); // Changed to 'img' for displaying images
    profilePicPlaceholder.src = "https://firebasestorage.googleapis.com/v0/b/twitter-clone-ec696.appspot.com/o/defaultPfp.svg?alt=media&token=784f6b42-3ba1-40db-9777-63ccbbb03099";
    profilePicPlaceholder.className = "profile-pic-placeholder"; // Add a class for styling
    form.appendChild(profilePicPlaceholder);


    const uploadButton = document.createElement('button');
    uploadButton.textContent = 'Upload Profile Picture';
    uploadButton.className = 'upload-profile-pic-button'; // Add custom styling
    
    const profilePicInput = createInputField('file', 'profile-pic-input', 'profilePic');
    profilePicInput.input.style.display = 'none'
    
    
    const displayNameInput = createInputField('text', 'name', 'Username');
    const emailInput = createInputField('email', 'email', 'Email'); // Reuse this if you want to keep the email input filled
    const passwordInput = createInputField('password', 'password', 'Password');
    
    
    const submitButton = createButton('Create Account');
    submitButton.className = "login-button";


    // error message display
    const errorMessage = document.createElement('span');
    errorMessage.className = 'error-message';
    errorMessage.textContent = "error";
    errorMessage.style.display = 'none';
    
    
    
    form.appendChild(profilePicPlaceholder)
    
    form.appendChild(errorMessage);
    
    form.appendChild(uploadButton);
    
    
    form.appendChild(profilePicInput.input);
    
    
    form.appendChild(displayNameInput.input);
    
    
    form.appendChild(emailInput.input);
    
    
    form.appendChild(passwordInput.input);
    
    form.appendChild(submitButton);

    const signupTextSpan = document.createElement('div')
    signupTextSpan.className = 'signup-span'
    form.appendChild(signupTextSpan)

    const signupText = document.createElement('p')
    signupText.textContent = "Already have an account?"
    signupTextSpan.appendChild(signupText)


   
    
    //the text iis how the stateButton knows which button it is
    signupTextSpan.appendChild(stateButton('Login','switch-form-button'))



    uploadButton.addEventListener('click', (e) => {
        e.preventDefault();
        profilePicInput.input.click(); // Trigger click on the actual file input
    });


    submitButton.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent form submission
        const file = profilePicInput.input.files[0]; // reference the image file
        createUser(emailInput.input.value, passwordInput.input.value, displayNameInput.input.value, file);
    });
    
    // Corrected function with proper Firestore data structure
    function createUser(email, password, displayName, imgFile) {
        createUserWithEmailAndPassword(auth, email, password)
            .then(userCredential => {
                let downloadURLPromise;
                if (imgFile) {
                    const storage = getStorage();
                    const storagePath = `profilePictures/${userCredential.user.uid}`;
                    const imageRef = storageRef(storage, storagePath);
                    downloadURLPromise = uploadBytes(imageRef, imgFile).then(snapshot => getDownloadURL(snapshot.ref));
                } else {
                    downloadURLPromise = Promise.resolve("https://firebasestorage.googleapis.com/v0/b/twitter-clone-ec696.appspot.com/o/defaultPfp.svg?alt=media&token=784f6b42-3ba1-40db-9777-63ccbbb03099"); // Default URL or logic for handling no image
                }
    
                downloadURLPromise.then(downloadURL => {
                    // Update Firestore document with all user info
                    return setDoc(doc(dbFirestore, "users", userCredential.user.uid), {
                        username: displayName,
                        email: userCredential.user.email,
                        profilePicture: downloadURL,
                        Likedtweets: [],
                        following: [],
                        followers: []
                    });
                }).then(() => {
                    console.log("User added to Firestore successfully.");
                    handleUserAuth(null, userCredential);
                }).catch((error) => {
                    console.error("Failed to add user to Firestore:", error);
                    handleUserAuth(error);
                });
            }).catch((creationError) => {
                console.error("Error creating new user:", creationError);
                handleUserAuth(creationError);
            });
    }
    
    
    function handleUserAuth(error, userCredential = null) {
        if (!error && userCredential) {
            // Fetch user profile from Firestore
            const userRef = doc(dbFirestore, "users", userCredential.user.uid);
            getDoc(userRef).then(docSnapshot => {
                if (docSnapshot.exists()) {
                    const userProfile = docSnapshot.data();
                    console.log("Logged in as", userProfile.username || "No Name", userProfile);
        
                    // Use userProfile data as needed in your application
                    AppState.setState({ isLoggedIn: true, user: { ...userCredential.user, ...userProfile }, currentComponent: 'home' });
                    // Update UI based on AppState or userProfile
                } else {
                    console.error("User profile not found in Firestore.");
                    // Handle missing user profile case
                    errorMessage.textContent = "User profile not found.";
                    errorMessage.style.display = 'block'; // Show the error message
                }
            }).catch((error) => {
                console.error("Failed to fetch user profile from Firestore:", error);
                // Handle errors
                errorMessage.textContent = error.message; // Show detailed error message
                errorMessage.style.display = 'block'; // Make the error message visible
            });
        } else {
            // Authentication failed, let's provide a user-friendly error message
            let errorMessageText = "An unexpected error occurred. Please try again."; // Default message
            if (error) {
                switch (error.code) {
                    case 'auth/invalid-email':
                        errorMessageText = "Please enter a valid email address.";
                        break;
                    case 'auth/user-disabled':
                        errorMessageText = "This account has been disabled. Please contact support.";
                        break;
                    case 'auth/user-not-found':
                        errorMessageText = "No user found with this email. Please sign up.";
                        break;
                    case 'auth/wrong-password':
                        errorMessageText = "Incorrect password. Please try again.";
                        break;
                    case 'auth/email-already-in-use':
                        errorMessageText = "This email is already in use. Please login or use a different email.";
                        break;
                    case 'auth/weak-password':
                        errorMessageText = "Password is too weak. Please use a stronger password.";
                        break;
                    // Add more error codes as needed
                    default:
                        console.error("Authentication failed:", error.message);
                        break;
                }
            }
            // Display the custom error message
            errorMessage.textContent = errorMessageText;
            errorMessage.style.display = 'block';
        }
    }
    
    
    
    function createInputField(type, name, placeholderText) {
        const input = document.createElement('input');
        input.type = type;
        input.id = name;
        input.name = name;
        input.required = true;
        input.placeholder = placeholderText; // Set placeholder text
    
        // Specific handling for file input to preview image
        if (type === 'file') {
            input.accept = "image/*"; // Accept images only
            input.onchange = (event) => {
                const [file] = event.target.files;
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        profilePicPlaceholder.src = e.target.result; // Update the src of profilePicPlaceholder with the selected image
                    };
                    reader.readAsDataURL(file);
                }
            };
        }
    
        return { input };
    }
    
    
    function createButton(text) {
        const button = document.createElement('button');
        button.textContent = text;
        return button;
    }
   
    return form;
}



export { createUserComponent };