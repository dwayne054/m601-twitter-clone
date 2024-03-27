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

    switch(state.currentComponent) {
        case 'home':
            appContainer.appendChild(createHomeComponent());
            break;
        case 'profile':
            appContainer.appendChild(profilePage());
            break;
        case 'login':
            appContainer.appendChild(loginFormComponent());
            break;
        case 'newUser':
            appContainer.appendChild(createUserComponent());
            break;
        default:
            console.error('Unknown component:', state.currentComponent);
            // Default component
    }
}

function setUserState(uid) {
    if (uid) {
        AppState.setState({
            currentComponent: 'home',
            isLoggedIn: true,
            user: { uid }
        });
    } else {
        AppState.setState({
            currentComponent: 'login',
            isLoggedIn: false,
            user: null
        });
    }
}


// 
function init() {
    const storedUid = localStorage.getItem('LoggedInUser');
    setUserState(storedUid && storedUid !== "undefined" && storedUid !== "" ? storedUid : null);

    AppState.subscribe(updateUI);
    updateUI();
}

init();

