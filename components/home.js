function createHomeComponent(){
    // Create a container for the home component
    const homeComponent = document.createElement('div');

    const homeName = document.createElement('p');
    const userName = document.createElement('p');
    const tweets = document.createElement('p');

    // Set content for these elements
    homeName.textContent = "Home";
    userName.textContent = "Username"; // Set this based on actual user data
    tweets.textContent = "Tweets"; // Update this to display actual tweets or relevant content

    // Append all created elements to the homeComponent container
    homeComponent.appendChild(homeName);
    homeComponent.appendChild(userName);
    homeComponent.appendChild(tweets);

    // Return the container with all its child elements
    return homeComponent;
}

export { createHomeComponent };
