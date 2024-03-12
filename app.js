import { loginFormComponent } from "./components/login.js";
import { createUserComponent } from "./components/createUser.js";
import { createHomeComponent } from "./components/home.js";
import AppState from "./components/state.js";

export const appContainer = document.getElementById('app-container');





export function updateUI() {
    // Clear current content by removing child nodes safely
    while (appContainer.firstChild) {
        appContainer.removeChild(appContainer.firstChild);
    }

    const state = AppState.getState();

    if (state.currentComponent === 'login') {
        const loginForm = loginFormComponent(); // Assuming this returns a DOM element
        appContainer.appendChild(loginForm);
    } else if (state.currentComponent === 'newUser') {
        const newUserForm = createUserComponent(); // Assuming this returns a DOM element
        appContainer.appendChild(newUserForm);
    } else if (state.currentComponent === 'home') {
        // Assuming you have a function that returns the Home component
        const homeComponent = createHomeComponent(); // Adjust this line to your actual home component creation function
        appContainer.appendChild(homeComponent);
    } else {
        console.error('Error in screen change: Unknown component');
    }
}


AppState.subscribe(updateUI);




function init() {
    // Initialization
    AppState.subscribe(updateUI); // Make sure AppState notifies on change
    updateUI(); // Initial UI setup based on AppState
}

init();
