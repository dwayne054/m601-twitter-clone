import AppState from "./state.js";
import { updateUI } from "../app.js"



function stateButton(text, idName) {
    const button = document.createElement('button');
    button.id = idName
    button.textContent = text;

    button.addEventListener('click', () => {
        // Directly modify AppState based on what you need to achieve
        const state = AppState.getState();

        //toggle logic, adjust according to app's needs
        if (state.currentComponent === "login" && state.isLoggedIn === false && text === "Sign Up") {
            AppState.setState({ currentComponent: 'newUser' });
            loginUser()
            console.log(text)
            updateUI()
        } else if (state.currentComponent === "newUser" && state.isLoggedIn === false && text === "Login") {
            AppState.setState({ currentComponent: 'login' }); // Assuming 'dashboard' is a valid state
            loginUser()
            console.log(text)
            updateUI()
    
        } else if (state.currentComponent === "home" && state.isLoggedIn === true && text === "profile") {
            AppState.setState({ currentComponent: 'profile'})
            console.log(text)
            updateUI()
        } else if (state.currentComponent === "profile" && state.isLoggedIn === true && text === "home") {
            AppState.setState({ currentComponent: 'home'})
            console.log(text)
            updateUI()

        } else if ( state.isLoggedIn === true && button.id === "logout-button-modal") {
            
            // Clear user session from local storage
            localStorage.setItem("LoggedInUser", "");
          
            // Update AppState for logout
            AppState.setState({ currentComponent: 'login', isLoggedIn: false, user: null });
            console.log(text);
            updateUI();

        }

        // Call updateUI to reflect AppState changes in the UI
        updateUI();
    });

    return button;
}




export { stateButton };
