"use client";

import Header from "./components/Header";
import Footer from "./components/Footer";
import Chat from "./components/Chat";
import ExampleQuestions from "./components/ExampleQuestions";
import VoiceInput from "./components/VoiceInput";
import { useState, useRef, useEffect } from "react";
import React from "react";

const CompactChatInput = React.forwardRef(function CompactChatInput({ onSend, loading }, inputRef) {
  const [input, setInput] = useState("");
  
  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };

  const handleTranscript = (transcript) => {
    if (transcript.trim()) {
      setInput(transcript);
      onSend(transcript);
      setInput("");
    }
  };

  return (
    <form onSubmit={handleSend} className="flex items-center gap-3 w-full max-w-2xl mx-auto h-full">
      <div className="relative flex flex-1 items-center">
        <div className="absolute inset-0 rounded-full border border-gray-200"></div>
        <div className="relative flex flex-1 items-center bg-gray-50 rounded-full shadow-sm px-4 py-2 sm:px-6 sm:py-3 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-1 transition-all duration-200 z-10">
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-400 text-base sm:text-lg"
            placeholder="Ask a question about your studies…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <button
            type="submit"
            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition disabled:opacity-50 sm:hidden"
            disabled={loading || !input.trim()}
            aria-label="Send"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-7.5-15-7.5v6l10 1.5-10 1.5v6z" />
            </svg>
          </button>
        </div>
      </div>
      <VoiceInput onTranscript={handleTranscript} setInput={setInput} />
    </form>
  );
});

export default function Home() {
  // For SSR/Next.js App Router, this can be refactored to use client components as needed
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const chatboxRef = useRef(null);
  const compactInputRef = useRef(null);

  // Placeholder for sending message to API
  const handleSend = async (msg) => {
    setLoading(true);
    setExpanded(true);
    // Add user message
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

  // Scroll to center chatbox when it expands
  useEffect(() => {
    if (messages.length === 1 && chatboxRef.current) {
      setTimeout(() => {
        chatboxRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 400); // Wait for the grow animation to finish
    }
  }, [messages.length]);

  // Focus input on first load
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
            className={`transition-all duration-500 ease-in-out w-full max-w-4xl ${messages.length === 0 ? 'h-[64px] mt-8' : 'h-[600px] mt-8'}`}
            style={{ overflow: messages.length === 0 ? 'hidden' : 'auto' }}
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
