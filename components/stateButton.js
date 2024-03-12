import AppState from "./state.js";
import { updateUI } from "../app.js"





function stateButton(text) {
    const button = document.createElement('button');
    button.textContent = text;

    button.addEventListener('click', () => {
        // Directly modify AppState based on what you need to achieve
        const state = AppState.getState();

        // Example toggle logic, adjust according to your app's needs
        if (state.currentComponent === "login" && state.isLoggedIn === false && text === "Sign Up") {
            AppState.setState({ currentComponent: 'newUser' });
            console.log('login')
            console.log(text)
            updateUI()
        } else if (state.currentComponent === "newUser" && state.isLoggedIn === false && text === "Login") {
            AppState.setState({ currentComponent: 'login' }); // Assuming 'dashboard' is a valid state
            console.log('new User')
            console.log(text)
            updateUI()
            
        } else if (state.currentComponent === "home") {
            AppState.setState({ currentComponent: 'home' }); // Assuming 'dashboard' is a valid state
        }

        // Call updateUI to reflect AppState changes in the UI
        updateUI();
    });

    return button;
}




export { stateButton };
