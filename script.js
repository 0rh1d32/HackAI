// Variables to track meals and reminders
let mealsEaten = 0;
let nextMealTime = 'Breakfast';
const mealTimes = {
    'Breakfast': 10,  // 10:00 AM
    'Lunch': 14,      // 2:00 PM
    'Dinner': 18      // 6:00 PM
};

// Track which meals have been marked as eaten
const mealsEatenStatus = {
    'Breakfast': false,
    'Lunch': false,
    'Dinner': false
};

// To debounce rapid commands
let isProcessingCommand = false;

// Initialize Speech Recognition (if available in the browser)
const recognition = window.SpeechRecognition || window.webkitSpeechRecognition ? new (window.SpeechRecognition || window.webkitSpeechRecognition)() : null;

if (recognition) {
    recognition.lang = 'en-US';
    recognition.continuous = true;

    recognition.onresult = (event) => {
        if (isProcessingCommand) return; // Ignore if a command is already being processed

        isProcessingCommand = true;
        const command = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        console.log(`Voice Command Received: ${command}`); // Debugging
        handleVoiceCommand(command);

        // Allow new commands after a short delay
        setTimeout(() => {
            isProcessingCommand = false;
        }, 2000); // Adjust delay as needed
    };
}

// Start Speech Recognition
function startVoiceRecognition() {
    if (!recognition) {
        speakText("Unfortunately, your browser does not support voice recognition.");
        return;
    }
    recognition.start();
    const instructions = `
        Voice control activated.
        You can say:
        - "What's my next meal?"
        - "How many meals have I eaten today?"
        Or mark meals as eaten, e.g., "Mark Breakfast as eaten."
    `;
    speakText(instructions);
}

// Stop Speech Recognition
function stopVoiceRecognition() {
    if (recognition) {
        recognition.stop();
        speakText("Voice control deactivated.");
    }
}

// Handle Voice Commands
function handleVoiceCommand(command) {
    if (command.includes("mark breakfast")) {
        mealClicked("Breakfast");
    } else if (command.includes("mark lunch")) {
        mealClicked("Lunch");
    } else if (command.includes("mark dinner")) {
        mealClicked("Dinner");
    } else if (command.includes("next meal")) {
        speakText(`Your next meal is ${nextMealTime}.`);
    } else if (command.includes("how many meals")) {
        speakText(`You have eaten ${mealsEaten} meal${mealsEaten > 1 ? 's' : ''} today.`);
    } else if (command.includes("stop voice recognition")) {
        stopVoiceRecognition();
    } else {
        speakText("Sorry, I didn't understand that command. Please try again.");
    }
}

// Function to handle when a meal is clicked
function mealClicked(meal) {
    const checkbox = document.getElementById(`${meal.toLowerCase()}-checkbox`);

    if (mealsEatenStatus[meal]) {
        speakText(`${meal} has already been marked as eaten.`);
        return;
    }

    mealsEaten++;
    mealsEatenStatus[meal] = true;

    document.getElementById('meal-count').innerText = `Meals eaten today: ${mealsEaten}`;

    // Determine the next meal
    if (meal === 'Breakfast') nextMealTime = 'Lunch';
    else if (meal === 'Lunch') nextMealTime = 'Dinner';
    else if (meal === 'Dinner') nextMealTime = 'Breakfast';

    document.getElementById('meal-reminder').innerText = `Time for your next meal: ${nextMealTime}`;
    speakText(`${meal} has been marked as eaten. Your next meal is ${nextMealTime}.`);

    // Start countdown to the next meal
    startCountdown(nextMealTime);

    // Update the checkbox for the meal
    checkbox.checked = true;
}

// Function to start a countdown to the next meal
function startCountdown(nextMeal) {
    const currentTime = new Date();
    const nextMealHour = mealTimes[nextMeal];
    let nextMealDate = new Date();

    nextMealDate.setHours(nextMealHour, 0, 0, 0);

    // If it's Dinner and Breakfast is the next meal, add a day
    if (nextMeal === 'Breakfast' && currentTime.getHours() >= mealTimes['Dinner']) {
        nextMealDate.setDate(nextMealDate.getDate() + 1);
    }

    clearInterval(window.countdownInterval);

    window.countdownInterval = setInterval(() => {
        const now = new Date();
        const timeDifference = nextMealDate - now;

        if (timeDifference <= 0) {
            clearInterval(window.countdownInterval);
            document.getElementById('meal-countdown').innerText = `Time for ${nextMeal}!`;
            speakText(`It's time for ${nextMeal}.`);
            return;
        }

        const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
        const seconds = Math.floor((timeDifference / 1000) % 60);

        document.getElementById('meal-countdown').innerText =
            `Time left until ${nextMeal}: ${hours} hours ${minutes} minutes ${seconds} seconds`;
    }, 1000);
}

// Function for Text-to-Speech
function speakText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    window.speechSynthesis.speak(utterance);
}
document.addEventListener('DOMContentLoaded', () => {
    const tellStoryBtn = document.getElementById('tell-story-btn');

    tellStoryBtn.addEventListener('click', () => {
        const storedStory = localStorage.getItem('userStory'); // Retrieve the story

        if (storedStory) {
            const utterance = new SpeechSynthesisUtterance(storedStory);
            utterance.lang = 'en-US';

            // Set voice and speak
            function setVoice() {
                const voices = window.speechSynthesis.getVoices();
                const selectedVoice = voices.find(voice => voice.name === "Google UK English Male");
                utterance.voice = selectedVoice || voices[0]; // Use selected or fallback voice
                utterance.rate = 0.9;

                // Cancel ongoing speech, then speak
                if (window.speechSynthesis.speaking) {
                    window.speechSynthesis.cancel();
                }
                window.speechSynthesis.speak(utterance);
            }

            if (window.speechSynthesis.getVoices().length === 0) {
                window.speechSynthesis.addEventListener('voiceschanged', setVoice);
            } else {
                setVoice();
            }
        } else {
            alert("No story found. Please save a story first.");
        }
    });
});