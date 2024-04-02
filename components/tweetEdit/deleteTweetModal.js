// deleteTweetModal.js
import { getFirestore, doc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { showAlert } from "../../app.js";

export function showDeleteTweetModal(tweetId) {
    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';

    const modalBackground = document.createElement('div');
    modalBackground.className = "modal-background";
    modalContainer.appendChild(modalBackground);

    const confirmationHeader = document.createElement('h1');
    confirmationHeader.textContent = 'Delete Post?';
    modalBackground.appendChild(confirmationHeader);

    const confirmationText = document.createElement('p');
    confirmationText.textContent = 'This can’t be undone and it will be removed from your profile, the timeline of any accounts that follow you, and from search results. ';
    modalBackground.appendChild(confirmationText);

    const confirmButton = document.createElement('button');
    confirmButton.textContent = 'Delete';
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
        const dbFirestore = getFirestore();
        const tweetDocRef = doc(dbFirestore, `tweets/${tweetId}`);
        await deleteDoc(tweetDocRef);
        modalContainer.remove(); // Close the modal after deletion
        const homeTab = document.getElementById("home-button");
        homeTab.click()
        showAlert('Tweet Succesfully Deleted')
    });

    cancelButton.addEventListener('click', () => {
        modalContainer.remove(); // Close the modal without deleting
    });
}


