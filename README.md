# AI Audio Local Chat

## Overview

AI Audio Local Chat is a web application that serves as an audio chatbot with artificial intelligence, playing the role of an English language teacher. The architecture is client-server based, with the client being a static web page that communicates with the server using a REST API.

## Architecture

### Client (Frontend)

- A static web page that initiates the audio recording when the user presses the "recording" button.
- Once the user releases the button, the audio data is sent to the Flask server via REST API.
- The browser receives the text response from the Flask server and forwards it to the `text-generation-webui` API.
- The `text-generation-webui` API processes the text using the LLM model and sends back a generated response.
- The browser then sends the generated text to the Flask API, which converts the text into an audio file and sends it back to the browser for playback.
- The chat history, including the user's text and the AI's response, is stored in a table named "history". This is because the LLM model requires the conversation history along with the new text input.

### Backend (Servers)

1. **text-generation-webui**: This server is initiated with the `api` flag and hosts the LLM model.
2. **Flask API**: Written in Python Flask, this server hosts the OpenAI Whisper model, which converts audio to text.

## Installation

### Setting up `text-generation-webui`

1. Clone the project from [text-generation-webui](https://github.com/oobabooga/text-generation-webui).
2. Follow the installation instructions for Windows.
3. Run `start_windows.bat`.
4. A modification was made to support subpath in nginx for proxy pass. In the `server.py` file, the following line was added:   `root_path="/webui"`.
   ```python
           shared.gradio['interface'].launch(
            prevent_thread_lock=True,
            share=shared.args.share,
            server_name=None if not shared.args.listen else (shared.args.listen_host or '0.0.0.0'),
            server_port=shared.args.listen_port,
            inbrowser=shared.args.auto_launch,
            auth=auth or None,
            ssl_verify=False if (shared.args.ssl_keyfile or shared.args.ssl_certfile) else True,
            ssl_keyfile=shared.args.ssl_keyfile,
            ssl_certfile=shared.args.ssl_certfile,
            root_path="/webui"
        )
   ```

### Starting the Project

1. Start nginx using the command `start nginx`.
2. Start the Flask server on port 5001 with the following commands:
   ```bash
   export FLASK_ENV=production
   python back/server.py
   ```
3. In the command line, start `text-generation-webui` with:
   ```bash
   start_windows.bat --extensions api --listen
   ```
    This command starts the application on port 7861 and the API on port 5000. Access the application at   
    [http://localhost:7861/](http://localhost:7861/) or [http://localhost/webui/](http://localhost/webui/).   
    Select a model from the list and click "load".
   ![webui](https://github.com/wysockilukas/ai_audio_locall_chat/assets/42555510/0400e928-d9e8-4efc-a29d-cddd35c1e545)
5. Start ngrok with the command 
   ```bash
    ngrok.exe http 80
   ```


In the nginx configuration, the following proxy pass settings are used:
- `/flaskapi` for `http://127.0.0.1:5001;`
- `/api/` for `http://127.0.0.1:5000`
- `/webui/` for `http://localhost:7861/`

## Code Structure

- **Backend**: The main server logic can be found in `back/server.py`.
- **Frontend**: The primary frontend files are  `front/app2.js`, and `front/index.html`.
- **Requirements**: All necessary Python packages are listed in `requirements.txt`.

## Conclusion

AI Audio Local Chat offers an innovative approach to language learning, leveraging the power of AI to provide real-time feedback to users. By integrating advanced models like LLM and OpenAI Whisper, the application ensures accurate and context-aware responses, enhancing the user's learning experience.
