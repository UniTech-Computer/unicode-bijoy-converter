//File Name: voice.js

(function () {
    // Check if the browser supports SpeechRecognition and navigator.mediaDevices
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    let recognition;
    let isListening = false;

    // Initialize SpeechRecognition if available
    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.lang = 'bn-BD'; // Set language to Bengali
        recognition.interimResults = true; // Show interim results
        recognition.continuous = true; // Keep listening after each result

        // Event when speech recognition returns a result
        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = document.getElementById('voiceTypingText').value || '';

            // Process each part of the result
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    finalTranscript += transcript;
                } else {
                    interimTranscript += transcript;
                }
            }

            // Update the textarea with final and interim transcripts
            const voiceTypingText = document.getElementById('voiceTypingText');
            if (voiceTypingText) {
                voiceTypingText.value = finalTranscript + interimTranscript;
            }
        };

        // Toggle voice typing: Requests microphone access, opens the text box, and starts recognition
        window.toggleVoiceTyping = function () {
            console.log("Attempting to access microphone...");

            // Request microphone access
            navigator.mediaDevices.getUserMedia({ audio: true })
                .then((stream) => {
                    console.log("Microphone access granted.");

                    // Stop the audio stream immediately after checking permission
                    stream.getTracks().forEach(track => track.stop());

                    // Now open the text box and start the voice typing process
                    startVoiceTyping();
                })
                .catch((error) => {
                    console.error("Microphone access error:", error);

                    // Display specific error messages for known cases
                    if (error.name === 'NotAllowedError') {
                        console.error("Microphone access was denied by the user.");
                    } else if (error.name === 'NotFoundError') {
                        console.error("No microphone was found on this device.");
                    } else if (error.name === 'NotReadableError') {
                        console.error("Microphone is already in use by another application.");
                    } else {
                        console.error("An unknown error occurred when accessing the microphone.");
                    }

                    // Show error message to the user
                    showError('Unable to access the microphone. Please check permissions and try again.');
                });
        };

        // Start voice typing function: Opens the text box and starts listening
        function startVoiceTyping() {
            if (!isListening) {
                try {
                    recognition.start();
                    isListening = true;
                    updateUI("Listening...", "🔴");
                    document.getElementById("voiceTypingBox").style.display = "block"; // Show text box
                    hideError();
                    console.log("Voice typing started.");
                } catch (err) {
                    console.error('Error starting recognition:', err);
                    showError("Unable to start voice typing. Please try again.");
                }
            }
        }

        // Stop voice typing function: Stops recognition and hides the text box
        function stopVoiceTyping() {
            if (isListening) {
                recognition.stop();
                isListening = false;
                updateUI("Click Here To Voice Typing", "🎤");
                document.getElementById("voiceTypingBox").style.display = "none"; // Hide text box
                console.log("Voice typing stopped.");
            }
        }

        // Update UI for the button and icon text
        function updateUI(buttonText, iconText) {
            const button = document.querySelector('.voice-typing-button');
            const icon = document.querySelector('.mic-icon');

            if (button) {
                button.innerText = buttonText;
                button.classList.toggle('active-listening', isListening);
            }
            if (icon) {
                icon.innerText = iconText;
            }
        }

        // Show error message in the UI
        function showError(message) {
            const errorContainer = document.getElementById('error-container');
            if (errorContainer) {
                errorContainer.innerText = message;
                errorContainer.style.display = 'block';
            }
        }

        // Hide error message
        function hideError() {
            const errorContainer = document.getElementById('error-container');
            if (errorContainer) errorContainer.style.display = 'none';
        }

        // Cleanup on page unload
        window.addEventListener('beforeunload', () => {
            if (recognition && isListening) {
                recognition.stop();
            }
        });

    } else {
        console.warn('Speech Recognition API is not supported in this browser.');
        showError('Your browser does not support speech recognition. Please use a compatible browser like Chrome or Edge.');
        document.querySelector('.voice-typing-button')?.style.display = 'none';
        document.querySelector('.mic-icon')?.style.display = 'none';
    }
})();
