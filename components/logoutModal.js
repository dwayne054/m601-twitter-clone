import { showAlert } from "../../app.js";
import { stateButton } from "./stateButton.js";

export function showLogoutModal() {
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';

    const modalBackground = document.createElement('div');
    modalBackground.className = "modal-background";
    modalContainer.appendChild(modalBackground);

    const confirmationHeader = document.createElement('h1');
    confirmationHeader.textContent = 'Logout?';
    modalBackground.appendChild(confirmationHeader);

    const confirmationText = document.createElement('p');
    confirmationText.textContent = 'Logging out will disconnect you from your account and require you to log in again to access your account features.';
    modalBackground.appendChild(confirmationText);

  
    const confirmButton = stateButton('logout', 'logout-button-modal');
    confirmButton.textContent = 'Logout';
    confirmButton.type = 'button';
    confirmButton.className = "delete-tweet";

    
    
    modalBackground.appendChild(confirmButton);

    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Cancel';
    cancelButton.type = 'button';
    cancelButton.className = 'cancel-tweet-delete'
    modalBackground.appendChild(cancelButton);

    document.body.appendChild(modalContainer);

    confirmButton.addEventListener('click', async () => {
        
        modalContainer.remove(); // Close the modal after deletion
        
        showAlert(' Succesfully Logged Out')
    });

    cancelButton.addEventListener('click', () => {
        modalContainer.remove(); // Close the modal without deleting
    });
}
