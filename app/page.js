"use client";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Chat from "./components/Chat";
import ExampleQuestions from "./components/ExampleQuestions";
import { useState, useRef, useEffect } from "react";
import React from "react";

const CompactChatInput = React.forwardRef(function CompactChatInput({ onSend, loading }, inputRef) {
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + ' ' + transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn("Speech Recognition API not supported in this browser.");
    }
  }, []);

  const toggleListening = () => {
    if (recognitionRef.current) {
      if (listening) {
        recognitionRef.current.stop();
        setListening(false);
      } else {
        recognitionRef.current.start();
        setListening(true);
      }
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  return (
    <form onSubmit={handleSend} className="flex items-center gap-2 w-full max-w-2xl mx-auto h-full">
      <div className="flex flex-1 items-center bg-gray-50 border border-gray-200 rounded-full shadow-sm px-4 py-2 focus-within:ring-2 focus-within:ring-primary transition">
        <input
          ref={inputRef}
          type="text"
          className="flex-1 bg-transparent outline-none border-none text-gray-900 placeholder-gray-400 text-base"
          placeholder="Ask a question about your studies…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
        />

        <button
          type="button"
          onClick={toggleListening}
          className={`ml-2 flex items-center justify-center w-10 h-10 rounded-full ${listening ? 'bg-red-500' : 'bg-primary'} text-white hover:bg-orange-500 transition disabled:opacity-50`}
          aria-label="Voice Input"
          disabled={loading}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 1.75c-1.24 0-2.25 1.01-2.25 2.25v6c0 1.24 1.01 2.25 2.25 2.25s2.25-1.01 2.25-2.25v-6c0-1.24-1.01-2.25-2.25-2.25zM19.5 10c0 4.15-3.35 7.5-7.5 7.5S4.5 14.15 4.5 10m7.5 11v-3" />
          </svg>
        </button>

        <button
          type="submit"
          className="ml-2 flex items-center justify-center w-10 h-10 rounded-full bg-primary text-white hover:bg-orange-500 transition disabled:opacity-50"
          disabled={loading || !input.trim()}
          aria-label="Send"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-7.5-15-7.5v6l10 1.5-10 1.5v6z" />
          </svg>
        </button>
      </div>
    </form>
  );
});


export default function Home() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const chatboxRef = useRef(null);
  const compactInputRef = useRef(null);

  const handleSend = async (msg) => {
    setLoading(true);
    setExpanded(true);
    const newHistory = [...messages, { role: 'user', content: msg }];
    setMessages(newHistory);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, history: messages }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply || 'Sorry, I could not generate a response.' },
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, there was an error contacting Amar AI.' },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (messages.length === 1 && chatboxRef.current) {
      setTimeout(() => {
        chatboxRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 400);
    }
  }, [messages.length]);

  useEffect(() => {
    if (messages.length === 0 && compactInputRef.current) {
      compactInputRef.current.focus();
    }
  }, [messages.length]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 via-white to-blue-50">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <h1 className="text-5xl md:text-5xl font-extrabold text-center mb-4 text-gray-900">
          Amar AI
        </h1>
        <p className="text-2xl text-gray-700 text-center max-w-2xl mb-0">
          By Hasan Ali Govt. High School
        </p>
        {messages.length === 0 && <ExampleQuestions onSelect={handleSend} />}
        <div className="w-full flex justify-center" ref={chatboxRef}>
          <div
            className={`transition-all duration-500 ease-in-out w-full max-w-4xl ${messages.length === 0 ? 'h-[64px] mt-8' : 'h-[90vh] mt-8'}`}
            style={{ overflow: 'hidden' }}
          >
            {messages.length === 0 ? (
              <CompactChatInput onSend={handleSend} loading={loading} ref={compactInputRef} />
            ) : (
              <Chat onSend={handleSend} loading={loading} messages={messages} className="h-full" />
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}