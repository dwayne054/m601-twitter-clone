
// state.js
let state = {
    isLoggedIn: false,
    user: null,
    currentComponent: 'login', // 'login', 'newUser', 'home'
};


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
