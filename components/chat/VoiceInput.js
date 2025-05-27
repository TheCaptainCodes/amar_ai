import { useState, useEffect } from 'react';

const VoiceInput = ({ onTranscript, setInput }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      console.log('SpeechRecognition available:', !!SpeechRecognition);
      
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true; // Changed to true to keep listening
          recognition.interimResults = true;
          recognition.lang = 'en-US';
          recognition.maxAlternatives = 1;

          let finalTranscriptText = '';

          recognition.onstart = () => {
            console.log('Speech recognition started');
            setIsListening(true);
            setError(null);
            finalTranscriptText = '';
          };

          recognition.onend = () => {
            console.log('Speech recognition ended');
            setIsListening(false);
            // Auto-submit the final transcript when voice input ends
            if (finalTranscriptText.trim()) {
              console.log('Final transcript:', finalTranscriptText);
              onTranscript(finalTranscriptText);
              setInput(''); // Clear input after submission
            }
          };

          recognition.onresult = (event) => {
            console.log('Speech recognition result:', event.results);
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
              const transcript = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscript += transcript;
              } else {
                interimTranscript += transcript;
              }
            }

            console.log('Interim transcript:', interimTranscript);
            console.log('Final transcript:', finalTranscript);

            // Update input with interim results
            if (interimTranscript) {
              setInput(interimTranscript);
            }
            
            if (finalTranscript) {
              finalTranscriptText = finalTranscript;
              setInput(finalTranscript);
            }
          };

          recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setError(event.error);
            setIsListening(false);
            
            // Handle specific errors
            switch (event.error) {
              case 'not-allowed':
                setError('Microphone access denied. Please allow microphone access in your browser settings.');
                break;
              case 'no-speech':
                setError('No speech detected. Please try speaking again.');
                break;
              case 'audio-capture':
                setError('No microphone found. Please check your microphone connection.');
                break;
              default:
                setError(`Error: ${event.error}`);
            }
          };

          recognition.onaudiostart = () => {
            console.log('Audio capturing started');
          };

          recognition.onsoundstart = () => {
            console.log('Sound detected');
          };

          recognition.onspeechstart = () => {
            console.log('Speech detected');
          };

          setRecognition(recognition);
        } catch (err) {
          console.error('Error initializing speech recognition:', err);
          setError('Failed to initialize speech recognition');
        }
      } else {
        setError('Speech recognition is not supported in your browser');
      }
    }
  }, [onTranscript, setInput]);

  const toggleListening = () => {
    console.log('Toggle listening called, current state:', isListening);
    if (!recognition) {
      console.error('Speech recognition not initialized');
      setError('Speech recognition not initialized');
      return;
    }

    if (isListening) {
      console.log('Stopping recognition');
      try {
        recognition.stop();
      } catch (err) {
        console.error('Error stopping recognition:', err);
      }
    } else {
      try {
        console.log('Starting recognition');
        recognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        setIsListening(false);
        setError('Failed to start speech recognition');
      }
    }
  };

  if (!recognition) {
    console.log('Speech recognition not available');
    return null;
  }

  return (
    <div className="relative">
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
      {error && (
        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm whitespace-nowrap">
          {error}
        </div>
      )}
    </div>
  );
};

export default VoiceInput; 