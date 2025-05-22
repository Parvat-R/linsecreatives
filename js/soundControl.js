const clickSoundURL = "/assets/sounds/click.wav";
const hoverSoundURL = "/assets/sounds/hover.wav";
const hoverOutSoundURL = "/assets/sounds/hover.wav";

// Create audio elements
const clickSound = new Audio(clickSoundURL);
const hoverSound = new Audio(hoverSoundURL);
const hoverOutSound = new Audio(hoverOutSoundURL);

// Set volume levels
clickSound.volume = 0.5;
hoverSound.volume = 0.91;
hoverOutSound.volume = 0.01;

// Sound state
var isMuted = false;

// Sound control button
const soundControl = document.getElementById('soundControl');
const waveOne = document.getElementById('waveOne');
const waveTwo = document.getElementById('waveTwo');

// Function to update the sound icon based on mute state
function updateSoundIcon() {
    if (isMuted) {
        // Display muted icon
        waveOne.style.display = 'none';
        waveTwo.style.display = 'none';
    } else {
        // Display sound on icon
        waveOne.style.display = '';
        waveTwo.style.display = '';
    }
}

// Toggle mute/unmute
soundControl.addEventListener('click', () => {
    isMuted = !isMuted;
    updateSoundIcon();
});

// Initialize sound icon state
updateSoundIcon();

// Get all elements with the musicElement class
const musicElements = document.querySelectorAll('.magnet-box');

// Add event listeners for each music element
musicElements.forEach(element => {
    // Click sound
    element.addEventListener('mousedown', () => {
        if (!isMuted) {
            // Clone the audio to allow multiple overlapping sounds
            const clickSoundClone = clickSound.cloneNode();
            clickSoundClone.play();
        }
    });

    // Hover sound (using mouseenter to avoid repeated triggering)
    element.addEventListener('mouseenter', () => {
        if (!isMuted) {
            // Clone the audio to allow multiple overlapping sounds
            const hoverSoundClone = hoverSound.cloneNode();
            hoverSoundClone.play();
        }
    });

    // Hover sound (using mouseleave to avoid repeated triggering)
    element.addEventListener('mouseleave', () => {
        if (!isMuted) {
            // Clone the audio to allow multiple overlapping sounds
            const hoverOutSoundClone = hoverOutSound.cloneNode();
            hoverOutSoundClone.play();
        }
    });
});