
// state.js
// Assuming AppState is your state management object

/*
let state = {
    isLoggedIn: true,
    user: {
        uid: 'RPFzns7JU7RRbLMxhyzX5maTIMk1'
    },
    currentComponent: 'home', // Assuming 'home' is the state indicating the home page should be displayed
};
*/

let state = {
    isLoggedIn: false,
    user: null,
    currentComponent: 'login'
}

// An array to keep track of functions (subscribers) that want to be notified when the state changes.
let subscribers = [];

const AppState = {
    // This is where the functionality of your state management is defined.
    getState: () => state,
    // A method to get the current state. It returns the state object.
    setState: (newState) => {
        state = { ...state, ...newState };
        AppState.notifySubscribers();
    },
    // Allows components or other parts of your application to subscribe to state changes.
    subscribe: (callback) => {
        subscribers.push(callback);
    },
    // This method goes through the subscribers array and calls each callback function, passing the current state as an argument. 
    notifySubscribers: () => {
        subscribers.forEach((callback) => callback(state));
    },
};


export default AppState;
