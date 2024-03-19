import { auth } from "../api/firebase.js";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import AppState from "../components/state.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { dbFirestore } from "../api/firebase.js"; // Ensure you have exported dbFirestore correctly from your firebase.js file
import { stateButton } from "./stateButton.js";
import { createUserComponent } from "./createUser.js";



// LoginComponent.js
function loginFormComponent() {
    const loginComponentContainer = document.createElement('div');
    loginComponentContainer.className = "login-container";



    const greetingBackground = document.createElement('div');
    greetingBackground.className = "greeting-background";
    loginComponentContainer.appendChild(greetingBackground);

    const joinTwitterContainer = document.createElement('div');
    joinTwitterContainer.className = "join-twitter-container";
    greetingBackground.appendChild(joinTwitterContainer);

    const joinTwitterText = document.createElement('p');
    joinTwitterText.textContent = "Join Today and see what's ahppening in the world right now"
    joinTwitterText.className = "join-twitter-text";
    joinTwitterContainer.appendChild(joinTwitterText);

    const joinTwitterImage = document.createElement('div');
    joinTwitterImage.className = "join-twitter-image";
    joinTwitterContainer.appendChild(joinTwitterImage);



    const formContainer = document.createElement('div');
    formContainer.className = "form-container";
    loginComponentContainer.appendChild(formContainer)

    const form = document.createElement('form');

    const logoContainer = document.createElement('div')
    logoContainer.className = 'logo-container';
    form.appendChild(logoContainer)

    
    const greetingText = document.createElement('h1')
    greetingText.textContent = " Welcome Back"
    form.appendChild(greetingText)
    
    form.className = "login-form";
    const emailInput = createInputField('email',  'email', 'Email');
    const passwordInput = createInputField('password',  'password', 'Password');
    
    
    const loginButton = createButton('Login');
    loginButton.className = 'login-button'

    // error message display
    const errorMessage = document.createElement('span');
    errorMessage.className = 'error-message';
    errorMessage.textContent = "error";
    errorMessage.style.display = 'none';
    form.appendChild(errorMessage);
    
    // email input
    form.appendChild(emailInput.input);
   
    // password input
    form.appendChild(passwordInput.input);

    // Add a forgot password link
    const forgotPasswordLink = document.createElement('a');

    forgotPasswordLink.textContent = "Forgot password?";
    forgotPasswordLink.className = 'forgot-password-link';
    form.appendChild(forgotPasswordLink);
    
    
    // login button
    form.appendChild(loginButton);

    formContainer.appendChild(form)

    const signupTextSpan = document.createElement('div')
    signupTextSpan.className = 'signup-span'
    formContainer.appendChild(signupTextSpan)

    const signupText = document.createElement('p')
    signupText.textContent = "Don't have an account yet?"

    signupTextSpan.appendChild(signupText)


    //the text is how the stateButton knows which button it is
    const signUpButton = createButton('Sign Up')
    signUpButton.id = "switch-form-button";
    signupTextSpan.appendChild(signUpButton)
    
    // Login event
    loginButton.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent form submission
        loginUser(emailInput.input.value, passwordInput.input.value, errorMessage);
    });
    
    
    function loginUser(email, password, errorElement) {
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                handleUserAuth(null, userCredential, errorElement);
            })
            .catch((error) => {
                handleUserAuth(error, null, errorElement);
            });
    }
    
    // change to the create user 
    signUpButton.addEventListener('click', () => {
       
        // Hide elements not needed for password reset 
        form.style.display = 'none'
        signupTextSpan.style.display = "none";
        const signUpForm = createUserComponent()
        formContainer.appendChild(signUpForm)

    });

    
    // Event listener for the forgot password link
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        switchToResetPasswordForm(form, signupTextSpan, formContainer);
    });

    
    

    // Local version of handleUserAuth for login
    function handleUserAuth(error, userCredential = null, errorElement) {
        if (!error && userCredential) {
            // Fetch the user profile from Firestore
            const userRef = doc(dbFirestore, "users", userCredential.user.uid);
            getDoc(userRef).then(docSnapshot => {
                if (docSnapshot.exists()) {
                    const userProfile = docSnapshot.data();
                    //console.log("Logged in as", userProfile.username || "No Name", userProfile);

                    // Merge Firestore user data with the auth user data
                    const mergedUserProfile = {
                        ...userCredential.user,
                        ...userProfile,
                        displayName: userProfile.username || userCredential.user.displayName,
                        photoURL: userProfile.profilePicture || userCredential.user.photoURL
                    };

                    

                    // Use merged user profile data in your application as needed
                    AppState.setState({ isLoggedIn: true, user: mergedUserProfile, currentComponent: 'home' });
                    console.log(mergedUserProfile)
                    localStorage.setItem("LoggedInUser", mergedUserProfile.uid);

                    // Call updateUI or similar function to refresh the UI with the user's data
                } else {
                    
        
                    // Extract message inside parentheses
                    const messageMatch = error.message.match(/\((.*)\)/);
                    const message = messageMatch ? messageMatch[1] : "An unknown error occurred.";

                    errorElement.textContent = message;
                    errorElement.style.display = 'block'; // Show the error message
                }
            }).catch((error) => {
                
        
                // Extract message inside parentheses
                const messageMatch = error.message.match(/\((.*)\)/);
                const message = messageMatch ? messageMatch[1] : "An unknown error occurred.";

                errorElement.textContent = message;
                errorElement.style.display = 'block'; // Show the error message
            });
        } else {
            
        
            // Extract message inside parentheses
            const messageMatch = error.message.match(/\((.*)\)/);
            const message = messageMatch ? messageMatch[1] : "An unknown error occurred.";

            errorElement.textContent = message;
            errorElement.style.display = 'block'; // Show the error message
        }
    }

    
    return loginComponentContainer;
}

// Function to switch to the reset password form
function switchToResetPasswordForm(form ,signupMessage, container) {
    
    // Hide elements not needed for password reset 
    form.style.display = 'none'
    signupMessage.style.display = "none";

    //Create the forgot password elements

    
    const forgotPasswordContainer = document.createElement('div');
    container.appendChild(forgotPasswordContainer)
    forgotPasswordContainer.className = "login-form";
    
    const logoContainer = document.createElement('div')
    logoContainer.className = 'logo-container';
    forgotPasswordContainer.appendChild(logoContainer)
    
    const errorElement = document.createElement('p');
    forgotPasswordContainer.appendChild(errorElement)
    
    const forgotPassword = createInputField('email',  'email', 'Enter your email to reset password');
    forgotPasswordContainer.appendChild(forgotPassword.input);
    

    // Create a submit button for reset
    const resetButton = createButton('Send Reset Email');
    resetButton.className = 'reset-password-button';
    forgotPasswordContainer.appendChild(resetButton);


    // Back to login link
    const backToLoginLink = document.createElement('p');
    backToLoginLink.textContent = "Back to login";
    backToLoginLink.className = 'back-to-login-link';
    forgotPasswordContainer.appendChild(backToLoginLink);

    // Event listener for the reset button
    resetButton.addEventListener('click', (e) => {
        e.preventDefault();
        const emailAddress = forgotPassword.input.value;
        resetEmail(emailAddress, errorElement);
        


    });


    // Event listener for back to login link
    backToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        // Remove reset specific elements
        forgotPasswordContainer.remove()
        resetButton.remove();
        backToLoginLink.remove();
        forgotPassword.input.remove();

        // Show elements hidden for password reset
        // Hide elements not needed for password reset 
        form.style.display = 'flex';
        signupMessage.style.display = "flex";


        
    });

}

async function resetEmail(email, errorElement) {
    try {
        await sendPasswordResetEmail(auth, email);
        errorElement.textContent = 'Reset email sent!';
        errorElement.id = "red-error";
        errorElement.style.color = '#17BF63'; // Indicate success
      
    } catch (error) {
        console.error('Error sending reset email:', error);
        errorElement.textContent = `Failed to send reset email`;
        errorElement.id = "green-error";
        errorElement.style.color = '#E0245E'; // Indicate error
       

    }
}



function createInputField(type, name, placeholderText) {
    

    const input = document.createElement('input');
    input.type = type;
    input.id = name;
    input.name = name;
    input.required = true;
    input.placeholder = placeholderText; // Set placeholder text

    return { input };
}


function createButton(text) {
    const button = document.createElement('button');
    button.textContent = text;
    return button;
}



// Export the createLoginForm function if using modules
export { loginFormComponent };
