import os
from io import BytesIO

import torch
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from gtts import gTTS

from faster_whisper import WhisperModel

app = Flask(__name__)
CORS(app)  # Enable CORS for the entire app

# Configuration
app.config['UPLOAD_FOLDER'] = 'uploads'
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(device)

model_size = "medium.en"
model = WhisperModel(model_size, device="cuda", compute_type="int8_float16")




def text_to_speech(text):
    tts = gTTS(text, lang='en')
    
    # Save to a temporary file
    temp_filename = "temp_speech.mp3"
    tts.save(temp_filename)
    
    # Read the temporary file into a BytesIO object
    audio_io = BytesIO()
    with open(temp_filename, "rb") as f:
        audio_io.write(f.read())
    audio_io.seek(0)
    
    # Cleanup: remove the temporary file
    os.remove(temp_filename)
    
    return audio_io



def _transcribe(f):
    segments, info = model.transcribe(f, beam_size=5)
    out_text = ''
    for segment in segments:
        out_text += segment.text + '\n'
    return out_text


@app.route('/flaskapi/upload', methods=['POST'])
def upload_file():
    if 'audio' not in request.files:
        return jsonify({'error': 'No audio file provided'}), 400

    file = request.files['audio']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
    file.save(filename)

    try:
        out = _transcribe(filename)
        os.remove(filename)  # Cleanup: remove the file after processing
        return jsonify({'message': 'ok', 'text': out}), 200
    except Exception as e:
        return jsonify({'error': f"An error occurred: {str(e)}"}), 500


@app.route('/flaskapi/generate_speech', methods=['POST'])
def generate_speech():
    text = request.json.get('text', '')
    if not text:
        return jsonify({'error': 'No text provided'}), 400

    audio_io = text_to_speech(text)
    return send_file(audio_io, mimetype='audio/mp3', as_attachment=True, download_name='response.mp3')



if __name__ == '__main__':
    app.run(port=5001)
