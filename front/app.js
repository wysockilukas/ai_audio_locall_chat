

const info = document.querySelector('.info')
info.innerHTML = 'start'

const recordButton = document.getElementById('recordButton');
let mediaRecorder;
let audioChunks = [];


let history = {
    internal: [],
    visible: []
};



navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = event => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
            sendData(audioBlob);
        };
    });

recordButton.addEventListener('mousedown', () => {
    audioChunks = [];
    mediaRecorder.start();
});

recordButton.addEventListener('mouseup', () => {
    mediaRecorder.stop();
});





function sendData(audioBlob) {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recordedAudio.wav');

    fetch('http://localhost/flaskapi/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log(data)
        info.innerHTML = data.text
    })
    .catch(error => console.error('Error:', error));
}






async function send_to_ai(text) {
    const URI = 'http://localhost/api/v1/chat';
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
        return data.results[0].history.visible.slice(-1)[0][1];
    } catch (error) {
        console.error('Error in send_to_ai:', error);
    }
}




async function initializeMedia() {

            let txt = "Hello my teacher"
            info.innerHTML = txt;
            const aiResponse = await send_to_ai(txt);
            console.log(`Teacher: ${aiResponse}`);
            // Assuming you have a function like `speak.text_to_speech` in JS
            // speak.text_to_speech(aiResponse);
            history.internal.push([txt, aiResponse]);
            history.visible.push([txt, aiResponse]);
        

}

async function test_api(txt) {
    info.innerHTML = txt;
    const aiResponse = await send_to_ai(txt);
    console.log(`Teacher: ${aiResponse}`);
    // Assuming you have a function like `speak.text_to_speech` in JS
    // speak.text_to_speech(aiResponse);
    history.internal.push([txt, aiResponse]);
    history.visible.push([txt, aiResponse]);
}



// initializeMedia();