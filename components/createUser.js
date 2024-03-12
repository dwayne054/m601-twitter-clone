import { auth } from "../api/firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { stateButton } from "./stateButton.js";
import AppState from "./state.js";


function createUserComponent(callback) {
    const form = document.createElement('form');
    const displayNameInput = createInputField('text', 'Display Name', 'displayName');
    const emailInput = createInputField('email', 'Email', 'email'); // Reuse this if you want to keep the email input filled
    const passwordInput = createInputField('password', 'Password', 'password');
    const profilePicInput = createInputField('file', 'Profile Picture', 'profilePic');
    const submitButton = createButton('Create Account');
   
    
    form.appendChild(displayNameInput.label);
    form.appendChild(displayNameInput.input);
    form.appendChild(document.createElement('br'));
    form.appendChild(emailInput.label);
    form.appendChild(emailInput.input);
    form.appendChild(document.createElement('br'));
    form.appendChild(passwordInput.label);
    form.appendChild(passwordInput.input);
    form.appendChild(document.createElement('br'));
    form.appendChild(profilePicInput.label);
    form.appendChild(profilePicInput.input);
    form.appendChild(document.createElement('br'));
    form.appendChild(submitButton);
    
    //the text iis how the stateButton knows which button it is
    form.appendChild(stateButton('Login'))


    submitButton.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent form submission
        createUser(emailInput.input.value, passwordInput.input.value, displayNameInput.input.value);
    });

    return form;
}

function createUser(email, password, displayName) {
    createUserWithEmailAndPassword(auth, email, password)
        .then(userCredential => {
            // User created, proceed with profile update
            updateProfile(userCredential.user, {
                displayName: displayName,
                photoURL: "url_to_profile_picture" // This should be replaced with actual logic to handle profile picture
            })
            .then(() => {
                // Profile updated, add user to database
                const db = getDatabase();
                set(ref(db, `users/${userCredential.user.uid}`), {
                    username: displayName,
                    email: userCredential.user.email,
                    profilePicture: "url_to_profile_picture" // Again, replace with actual profile picture logic
                })
                .then(() => {
                    console.log("User added to the database successfully.");
                    handleUserAuth(null, userCredential);
                })
                .catch(databaseError => {
                    console.error("Failed to add user to the database:", databaseError);
                    handleUserAuth(databaseError);
                });
            })
            .catch(profileError => {
                console.error("Error updating user profile:", profileError);
                handleUserAuth(profileError);
            });
        })
        .catch(creationError => {
            console.error("Error creating new user:", creationError);
            handleUserAuth(creationError);
        });
}

function handleUserAuth(error, userCredential = null) {
    if (!error) {
        console.log("Operation successful", userCredential);
        AppState.setState({ isLoggedIn: true, user: userCredential.user, currentComponent: 'home' });
        // updateUI();
    } else {
        console.error("Operation failed:", error.message);
        // Here, update the AppState to potentially show an error message, or stay on the current form
        // You might also directly update the UI to reflect the error
    }
}


function createInputField(type, labelText, name) {
    const label = document.createElement('label');
    label.textContent = labelText + ': ';
    const input = document.createElement('input');
    input.type = type;
    input.id = name;
    input.name = name;
    input.required = true;
    return { label, input };
}

function createButton(text) {
    const button = document.createElement('button');
    button.textContent = text;
    return button;
}


export { createUserComponent };