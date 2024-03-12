import { auth } from "../api/firebase.js";
import { signInWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

import AppState from "../components/state.js";
import { stateButton } from "./stateButton.js";


// LoginComponent.js
function loginFormComponent() {
    const form = document.createElement('form');
    const emailInput = createInputField('email', 'Email', 'email');
    const passwordInput = createInputField('password', 'Password', 'password');
    const loginButton = createButton('Login');
    
    
    
    form.appendChild(emailInput.label);
    form.appendChild(emailInput.input);
    form.appendChild(document.createElement('br'));
    form.appendChild(passwordInput.label);
    form.appendChild(passwordInput.input);
    form.appendChild(document.createElement('br'));
    form.appendChild(loginButton);
    
    //the text iis how the stateButton knows which button it is
    form.appendChild(stateButton('Sign Up'))

    // Login event
    loginButton.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent form submission
        loginUser(emailInput.input.value, passwordInput.input.value);
    });

    

    // Adjust loginUser function to use the callback
    function loginUser(email, password) {
        signInWithEmailAndPassword(auth, email, password)
            .then(userCredential => {
                handleUserAuth(null, userCredential);
            })
            .catch(error => {
                handleUserAuth(error);
            });
    }

    // Local version of handleUserAuth for login
    function handleUserAuth(error, userCredential = null) {
        if (!error) {
            // Login was successful
            console.log("User logged in successfully", userCredential);
            AppState.setState({ isLoggedIn: true, user: userCredential.user, currentComponent: 'home' }); // Adjust as needed
            // updateUI();
        } else {
            // There was an error during login
            console.error("Authentication error:", error.message);
            // Potentially update the AppState to show an error message or stay on the login form
            // Optionally update the UI directly here to show the error
        }
    }
    
    return form;
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



// Export the createLoginForm function if using modules
export { loginFormComponent };
