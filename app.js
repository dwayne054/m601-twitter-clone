import { loginFormComponent } from "./components/login.js";
import { createUserComponent } from "./components/createUser.js";
import { createHomeComponent } from "./components/home.js";
import { profilePage } from "./components/profilePage.js";
import AppState from "./components/state.js";

export const appContainer = document.getElementById('app-container');

function logUser(user) {
    // Update AppState
    AppState.setState({ currentComponent: 'home', isLoggedIn: true, user: user });
    // Update local storage
    localStorage.setItem('loggedInUser', JSON.stringify(user));
    updateUI();
}



export function updateUI() {
    while (appContainer.firstChild) {
        appContainer.removeChild(appContainer.firstChild);
    }

    const state = AppState.getState();

    if (state.currentComponent === 'home') {
        const homeComponent = createHomeComponent()
        appContainer.appendChild(homeComponent)
        //console.log(AppState.getState(state.user.uid))
    } else if (state.currentComponent === 'profile') {
        // case for profile component
        const profileComponent = profilePage(); // Synchronously create the profile page
        appContainer.appendChild(profileComponent);
    } else {
        let component;
        if (state.currentComponent === 'login') {
            component = loginFormComponent();
        } else if (state.currentComponent === 'newUser') {
            component = createUserComponent();
        }

        if (component) {
            appContainer.appendChild(component);
        } else {
            console.error('Error in screen change: Unknown component');
        }
    }
}


function init() {
    // Initialization
    const storedUid = localStorage.getItem('LoggedInUser');
    
    if (storedUid) {
        // There's a UID stored, implying the user is logged in
        console.log(storedUid);
        AppState.setState({
            currentComponent: 'home', // Assuming 'home' is the component to show when logged in
            isLoggedIn: true,
            user: { uid: storedUid } // Assuming you're only interested in UID for now
        });
    } else {
        // No stored UID, imply user is not logged in, start with a login or signup component
        AppState.setState({
            currentComponent: 'login', // Or 'signup' as your app's starting point
            isLoggedIn: false,
            user: null
        });
    }

    AppState.subscribe(updateUI); // Subscribe to AppState changes
    updateUI(); // Initial UI update based on the current AppState
}

init();

