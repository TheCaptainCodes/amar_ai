import { useState, useEffect } from 'react';

const VoiceInput = ({ onTranscript, setInput }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        let finalTranscriptText = '';

        recognition.onstart = () => {
          setIsListening(true);
          finalTranscriptText = '';
        };

        recognition.onend = () => {
          setIsListening(false);
          // Auto-submit the final transcript when voice input ends
          if (finalTranscriptText.trim()) {
            onTranscript(finalTranscriptText);
            setInput(''); // Clear input after submission
          }
        };

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          
          setInput(transcript);
          
          if (event.results[0].isFinal) {
            finalTranscriptText = transcript;
          }
        };

        setRecognition(recognition);
      }
    }
  }, [onTranscript, setInput]);

  const toggleListening = () => {
    if (isListening) {
      recognition?.stop();
    } else {
      recognition?.start();
    }
  };

  if (!recognition) {
    return null;
  }

  return (
    <button
      onClick={toggleListening}
      className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-200 ${
        isListening 
          ? 'bg-red-500 text-white animate-pulse' 
          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
      }`}
      aria-label={isListening ? 'Stop recording' : 'Start recording'}
      type="button"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2}
        stroke="currentColor"
        className="w-5 h-5 sm:w-6 sm:h-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
        />
      </svg>
    </button>
  );
};

export default VoiceInput; 