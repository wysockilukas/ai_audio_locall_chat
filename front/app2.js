// console.log('start')
const hostname = window.location.hostname;

let apiBaseURL;


if (hostname === "localhost" || hostname === "127.0.0.1") {
    apiBaseURL = "http://localhost";
} else {
    apiBaseURL = window.location.origin;
}



const chatContainer = document.getElementById('chatContainer');

const recordButton = document.getElementById('recordButton');
let mediaRecorder;
let audioChunks = [];

let history = {
    internal: [],
    visible: []
};


function appendMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.textContent = message;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;  // Scroll to the bottom
}


function decodeHtmlEntities(str) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = str;
    return textArea.value;
}





async function initializeMedia() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            const data = await sendData(audioBlob);
            appendMessage(data.text, 'user');
            const aiResponse = await send_to_ai(data.text);
            // console.log(`Teacher: ${aiResponse}`);
            appendMessage(aiResponse, 'ai');
            // Assuming you have a function like `speak.text_to_speech` in JS
            // speak.text_to_speech(aiResponse);
            history.internal.push([data.text, aiResponse]);
            history.visible.push([data.text, aiResponse]);

            await playSpeech(aiResponse); 
        };
    } catch (error) {
        console.error('Error initializing media:', error);
    }
}


// Funkcje obsługi zdarzeń
function startRecording() {
    audioChunks = [];
    recordButton.innerText = 'Recording...';
    mediaRecorder.start();
}

function stopRecording() {
    mediaRecorder.stop();
    recordButton.innerText = 'Waiting for AI...';
    recordButton.disabled = true;  // Disable the button
}

// Dodawanie nasłuchiwaczy zdarzeń dla komputera
recordButton.addEventListener('mousedown', startRecording);
recordButton.addEventListener('mouseup', stopRecording);

// Dodawanie nasłuchiwaczy zdarzeń dla urządzeń dotykowych
recordButton.addEventListener('touchstart', (e) => {
    e.preventDefault(); // Zapobieganie emulacji zdarzeń myszy
    startRecording();
});

recordButton.addEventListener('touchend', (e) => {
    e.preventDefault(); // Zapobieganie emulacji zdarzeń myszy
    stopRecording();
});





async function sendData(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recordedAudio.wav');

    try {
        const response = await fetch(`${apiBaseURL}/flaskapi/upload`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error sending data:', error);
    }
}

async function send_to_ai(text) {
    const URI = `${apiBaseURL}/api/v1/chat`;
    const request = {
        'user_input': text,
        'history': history,
        'max_new_tokens': 250,
        'auto_max_new_tokens': false,
        'max_tokens_second': 0,
        'mode': 'chat',  
        'character': 'English teacher',
        'instruction_template': null,
        'your_name': 'Student',
        'context': "You act as an English teacher who specializes in grammar and enjoys finding mistakes and correcting students. You answer students' questions and give feedback if they make mistakes. Your main goal is to hold conversations with your students. You come up with conversation topics and adjust the level of difficulty during the conversation by assessing the student's level on an ongoing basis",
        'regenerate': false,
        '_continue': false,
         'chat_instruct_command': 'Continue the conversation below as an English teacher. Correct any grammar mistakes and provide feedback.',
        'preset': null,
        'do_sample': true,
        'temperature': 0.7,
        'top_p': 0.1,
        'typical_p': 1,
        'epsilon_cutoff': 0, 
        'eta_cutoff': 0, 
        'tfs': 1,
        'top_a': 0,
        'repetition_penalty': 1.18,
        'repetition_penalty_range': 0,
        'top_k': 40,
        'min_length': 0,
        'no_repeat_ngram_size': 0,
        'num_beams': 1,
        'penalty_alpha': 0,
        'length_penalty': 1,
        'early_stopping': false,
        'mirostat_mode': 0,
        'mirostat_tau': 5,
        'mirostat_eta': 0.1,
        'grammar_string': '',
        'guidance_scale': 1,
        'negative_prompt': '',
        'seed': -1,
        'add_bos_token': true,
        'truncation_length': 2048,
        'ban_eos_token': false,
        'custom_token_bans': '',
        'skip_special_tokens': true,
        'stopping_strings': []        
    };

    try {
        const response = await fetch(URI, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const ai_response = data.results[0].history.visible.slice(-1)[0][1]
        const decodedStr =  decodeHtmlEntities(ai_response)
        return decodedStr;
    } catch (error) {
        console.error('Error in send_to_ai:', error);
    }
}



async function playSpeech(text) {
    const response = await fetch(`${apiBaseURL}/flaskapi/generate_speech`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: text })
    });

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    // Dodajemy obsługę zdarzenia 'ended' dla obiektu Audio
    audio.onended = function() {
        // console.log("Audio playback finished.");
        recordButton.innerText = 'Record'
        recordButton.disabled = false; // Włącz przycisk po zakończeniu odtwarzania
    };    

    audio.play();
}



initializeMedia();
