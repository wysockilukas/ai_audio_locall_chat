import html
import json

import requests

import speak

# For local streaming, the websockets are hosted without ssl - http://
HOST = 'localhost:5000'
URI = f'http://{HOST}/api/v1/chat'
URI = f'http://localhost/api/v1/chat'

# For reverse-proxied streaming, the remote will likely host with ssl - https://
# URI = 'https://your-uri-here.trycloudflare.com/api/v1/chat'


def run(user_input, history):
    request = {
        'user_input': user_input,
        'max_new_tokens': 250,
        'auto_max_new_tokens': False,
        'max_tokens_second': 0,
        'history': history,
        'mode': 'chat',  # Valid options: 'chat', 'chat-instruct', 'instruct'
        'character': 'English teacher',
        # 'instruction_template': 'Vicuna-v1.1',  # Will get autodetected if unset
        'instruction_template': None,
        'your_name': 'Student',
        'context': "You act as an English teacher who specializes in grammar and enjoys finding mistakes and correcting students. You answer students' questions and give feedback if they make mistakes. Your main goal is to hold conversations with your students. You come up with conversation topics and adjust the level of difficulty during the conversation by assessing the student's level on an ongoing basis",

        # 'name1': 'name of user', # Optional
        # 'name2': 'name of character', # Optional
        # 'context': 'character context', # Optional
        # 'greeting': 'greeting', # Optional
        # 'name1_instruct': 'You', # Optional
        # 'name2_instruct': 'Assistant', # Optional
        # 'context_instruct': 'context_instruct', # Optional
        # 'turn_template': 'turn_template', # Optional
        'regenerate': False,
        '_continue': False,
        # 'chat_instruct_command': 'Continue the chat dialogue below. Write a single reply for the character "<|character|>".\n\n<|prompt|>',
        'chat_instruct_command': 'Continue the conversation below as an English teacher. Correct any grammar mistakes and provide feedback.',
        
        # Generation params. If 'preset' is set to different than 'None', the values
        # in presets/preset-name.yaml are used instead of the individual numbers.
        'preset': 'None',
        'do_sample': True,
        'temperature': 0.7,
        'top_p': 0.1,
        'typical_p': 1,
        'epsilon_cutoff': 0,  # In units of 1e-4
        'eta_cutoff': 0,  # In units of 1e-4
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
        'early_stopping': False,
        'mirostat_mode': 0,
        'mirostat_tau': 5,
        'mirostat_eta': 0.1,
        'grammar_string': '',
        'guidance_scale': 1,
        'negative_prompt': '',

        'seed': -1,
        'add_bos_token': True,
        'truncation_length': 2048,
        'ban_eos_token': False,
        'custom_token_bans': '',
        'skip_special_tokens': True,
        'stopping_strings': []
    }

    response = requests.post(URI, json=request)

    if response.status_code == 200:
        ai_response = response.json()['results'][0]['history']['visible'][-1][1]
        return ai_response
    else:
        print(f"Error: Received status code {response.status_code}")
        print(response.content)
        return None


if __name__ == '__main__':
    # Initial conversation history
    history = {
        'internal': [],
        'visible': []
    }

    print("Start chatting with the English teacher AI. Type 'exit' to end the conversation.")
    
    while True:
        # Get user input
        user_input = input("You: ")
        
        # Check if the user wants to exit
        if user_input.lower() == 'exit':
            print("Ending the conversation. Goodbye!")
            break

        # Get AI response and update the conversation history
        ai_response = run(user_input, history)
        
        if ai_response:
            print(f"Teacher: {ai_response}")
            speak.text_to_speach(ai_response)
            history['internal'].append([user_input, ai_response])
            history['visible'].append([user_input, ai_response])