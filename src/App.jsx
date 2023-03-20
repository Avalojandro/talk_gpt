import { useState, useRef } from 'react';
import './css/App.css';
import axios from 'axios';

const apiKey = import.meta.env.VITE_REACT_API_KEY;
const engine = 'text-davinci-003';

const { webkitSpeechRecognition, speechSynthesis } = window;
const recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'es-ES';

export default function App() {
  const [responseGpt, setResponseGpt] = useState(undefined);
  const [transcript, setTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef(recognition);

  const handleResult = (event) => {
    const results = event.results;
    const transcript = results[results.length - 1][0].transcript;
    setTranscript(transcript);
  };

  const startButton = () => {
    setResponseGpt('');
    setTranscript('');
    recognitionRef.current.addEventListener('result', handleResult);
    recognitionRef.current.start();
    setIsRecording(true);
  };

  const stopButton = () => {
    recognitionRef.current.removeEventListener('result', handleResult);
    recognitionRef.current.stop();
    setIsRecording(false);
  };

  const talk = () => {
    const msg = responseGpt;
    const voices = window.speechSynthesis.getVoices();
    const utterance = new SpeechSynthesisUtterance(msg);
    utterance.voice = voices[0];
    utterance.pitch = 1;
    utterance.rate = 1;
    speechSynthesis.speak(utterance);
  }

  const submit = () => {
    axios.post(`https://api.openai.com/v1/engines/${engine}/completions`, {
      prompt: transcript,
      max_tokens: 100,
      n: 1,
      temperature: 0.5,
    }, {
      headers: { Authorization: `Bearer ${apiKey}` }
    })
    .then(response => {
      console.log(response.data);
      setResponseGpt(response.data?.choices[0]?.text);
      talk();
    })
    .catch(error => {

    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800">

    <div className='mb-14'>
    <div className=' font-bold text-[5.5rem] text-white'>
      Talk_GPT
    </div>
    <div className='text-white text-center'>By Avalojandro</div>
    </div>

      <div className='mb-4'>
        {
          !isRecording && (
            <button             
            onClick={startButton}
            disabled={isRecording} 
            className='bg-green-600 hover:bg-green-700 transition-all text-white p-2 rounded-full'>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
            </button>
          )
        }

        {
          isRecording && (
            <button 
            onClick={stopButton}
            disabled={!isRecording}
            className='bg-red-500 hover:bg-red-600 transition-all text-white p-2 rounded-full'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-6 h-6">
                <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
            </svg>

            </button>            
          )
        }
      </div>
        <div className=' bg-gray-600 items-center text-justify px-5 py-2 text-gray-300 rounded-lg w-3/4 max-w-3xl flex'>
            <div className='w-full'>
                  {
                    transcript || '...'
                  }
            </div>
            <div className='w-8 ml-4'>
            <button className='bg-cyan-500 hover:bg-cyan-600 transition-all p-2 rounded-lg' disabled={isRecording} onClick={submit}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
            </div>
        </div>

          {responseGpt && (
            <div className='mt-8 text-white w-2/4 text-justify' onClick={() => {talk();}}>
              {responseGpt || ''}
            </div>
          )}
    
    </div>
  );
}