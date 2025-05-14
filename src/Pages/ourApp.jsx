import React from 'react'
import Navbar from '../Components/Navbar/Navbar';

const ourApp = () => {

    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (event) => {
        // Prevent the default mini-info bar or install prompt
        event.preventDefault();
        
        // Store the event for later use
        deferredPrompt = event;

        // Optionally, show a custom install button (useful for mobile users)
        const installButton = document.createElement('button');
        installButton.innerText = 'Install App';
        document.body.appendChild(installButton);

        // Only show the button if the user is on mobile (optional)
        if (isMobile()) {
            installButton.style.display = 'block';
        }

        // Handle button click to trigger the install prompt
        installButton.addEventListener('click', () => {
            // Show the install prompt
            deferredPrompt.prompt();
            // Wait for the user to respond to the prompt
            deferredPrompt.userChoice
                .then((choiceResult) => {
                    if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                    } else {
                        console.log('User dismissed the install prompt');
                    }
                    deferredPrompt = null; // Reset the deferred prompt
                });
        });
    });

    // Function to detect if the user is on a mobile device (basic)
    function isMobile() {
        return /Mobi|Android/i.test(navigator.userAgent);
    }

    window.addEventListener('appinstalled', (event) => {
        // Optionally hide the custom install button or remove it
        const installButton = document.querySelector('button');
        if (installButton) {
          installButton.style.display = 'none';
        }
      });
    
    
    return (
        <>
        <Navbar />
        Our App Page
        </>
    )
}

export default ourApp