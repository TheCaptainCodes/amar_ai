"use client";

import Chat from "@/components/chat/chat";
import ExampleQuestions from "@/components/chat/example-questions";
import { useState, useRef, useEffect, ForwardedRef } from "react";
import React from "react";

interface CompactChatInputProps {
  onSend: (msg: string) => void;
  loading: boolean;
}

const CompactChatInput = React.forwardRef(function CompactChatInput({ onSend, loading }: CompactChatInputProps, inputRef: ForwardedRef<HTMLInputElement>) {
  const [input, setInput] = useState("");
  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput("");
  };
  return (
    <form onSubmit={handleSend} className="flex items-center gap-2 w-full max-w-2xl mx-auto h-full">
      <div className="flex flex-1 items-center bg-gray-50 border border-gray-200 rounded-full shadow-sm px-4 py-2 sm:px-6 sm:py-3 focus-within:ring-2 focus-within:ring-gray-300 transition">
        <input
          ref={inputRef}
          type="text"
          className="flex-1 bg-transparent outline-none border-none text-gray-900 placeholder-gray-400 text-base sm:text-lg"
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
          className="ml-2 flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition disabled:opacity-50 sm:hidden"
          disabled={loading || !input.trim()}
          aria-label="Send"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-7.5-15-7.5v6l10 1.5-10 1.5v6z" />
          </svg>
        </button>
      </div>
    </form>
  );
});

export default function Home() {
  // For SSR/Next.js App Router, this can be refactored to use client components as needed
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "assistant", content: string }[]>([]);
  const [expanded, setExpanded] = useState(false);
  const chatboxRef = useRef<HTMLDivElement>(null);
  const compactInputRef = useRef<HTMLInputElement>(null);

  // Placeholder for sending message to API
  const handleSend = async (msg: string) => {
    setLoading(true);
    setExpanded(true);
    // Add user message
    const newHistory = [...messages, { role: 'user', content: msg }];
    setMessages(newHistory as { role: "user" | "assistant", content: string }[]);
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
    } catch (e: any) {
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
        chatboxRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 pt-0">
        <h1 className="text-5xl md:text-5xl font-extrabold text-center mb-0 text-gray-900 mt-5">
          Amar AI
        </h1>
        {messages.length === 0 && <ExampleQuestions onSelect={handleSend} />}
        <div className="w-full flex justify-center" ref={chatboxRef}>
          <div
            className={`w-full max-w-7xl ${messages.length === 0 ? 'h-[64px] mt-0' : 'h-[90vh] mt-8'}`}
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
    </div>
  );
}