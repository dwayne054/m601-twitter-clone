import { loginFormComponent } from "./components/login.js";
import { createUserComponent } from "./components/createUser.js";
import { createHomeComponent } from "./components/home.js";
import { profilePage } from "./components/profilePage.js";
import AppState from "./components/state.js";

export const appContainer = document.getElementById('app-container');



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
            appContainer.appendChild(loginFormComponent());

    }
}

export function showAlert(message, duration = 3000) {
    const alertContainer = document.createElement('div');
    alertContainer.className = 'custom-alert';
    
    const alertMessage = document.createElement('p');
    alertMessage.textContent = message;

    const alertImage = document.createElement('img')
    alertImage.src = './assets/check1.svg';

    
    alertContainer.appendChild(alertMessage);
    alertContainer.appendChild(alertImage)

    document.body.appendChild(alertContainer);
    

    setTimeout(() => {
        alertContainer.remove();
    }, duration);

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


// initialize app 
function init() {
    const storedUid = localStorage.getItem('LoggedInUser');
    setUserState(storedUid && storedUid !== "undefined" && storedUid !== "" ? storedUid : null);

    AppState.subscribe(updateUI);
    updateUI();
}

init();

