// This is a comment to trigger re-processing
import { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const VoiceInput = ({ onTranscript, setInput }) => {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition({
    continuous: false,
    // interimResults is true by default in useSpeechRecognition
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    // Check browser support on mount
    if (!browserSupportsSpeechRecognition) {
      setError('Speech recognition is not supported in your browser');
    } else {
      setError(null);
    }
  }, [browserSupportsSpeechRecognition]);

  useEffect(() => {
    // Update input with the transcript as it changes
    setInput(transcript);
  }, [transcript, setInput]);


  const toggleListening = () => {
    console.log('toggleListening called. Current transcript:', transcript);
    if (!browserSupportsSpeechRecognition) {
      setError('Speech recognition is not supported in your browser');
      return;
    }

    if (listening) {
      // When stopping, we consider the current transcript as final
      SpeechRecognition.stopListening();
      console.log('Checking transcript before submit:', transcript);
      if (transcript.trim()) {
        console.log('Submitting transcript:', transcript);
        onTranscript(transcript);
        setInput(''); // Clear input after submission
        resetTranscript(); // Reset the library's transcript state
      }
    } else {
      setError(null); // Clear previous errors on start
      SpeechRecognition.startListening();
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="relative">
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm whitespace-nowrap">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={toggleListening}
        className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full transition-all duration-200 ${
          listening 
            ? 'bg-red-500 text-white animate-pulse' 
            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
        }`}
        aria-label={listening ? 'Stop recording' : 'Start recording'}
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
      {error && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
};

export default VoiceInput; 