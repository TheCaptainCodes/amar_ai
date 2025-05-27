"use client";

import React, { useRef, useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeHighlight from 'rehype-highlight';
import VoiceInput from './VoiceInput';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatProps {
  onSend: (msg: string) => void;
  loading: boolean;
  messages: Message[];
  className?: string;
}

export default function Chat({ onSend, loading, messages, className = "" }: ChatProps) {
  const [input, setInput] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSend(input);
    setInput('');
  };

  const handleTranscript = (transcript: string) => {
    if (transcript.trim()) {
      setInput(transcript);
      onSend(transcript);
      setInput('');
    }
  };

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Focus input after AI sends a response or on first load
  useEffect(() => {
    if (
      (messages.length > 0 && messages[messages.length - 1].role === 'assistant' && inputRef.current && document.activeElement !== inputRef.current) ||
      (messages.length === 0 && inputRef.current && document.activeElement !== inputRef.current)
    ) {
      inputRef.current.focus();
    }
  }, [messages]);

  return (
    <div className={`w-full max-w-4xl mx-auto flex flex-col h-[90vh] bg-white rounded-xl shadow-lg border border-gray-100 ${className}`}>
      <div ref={chatRef} className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col">
        {messages.length === 0 && (
          <div className="text-gray-400 text-center mt-12">Ask a question to get started!</div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={
              msg.role === 'user'
                ? 'self-end'
                : 'self-start'
            }
          >
            <div
              className={
                'px-4 py-2 rounded-2xl mb-1 break-words ' +
                (msg.role === 'user'
                  ? 'bg-blue-500 text-white whitespace-normal max-w-[90vw] sm:max-w-[70vw] md:max-w-[500px]'
                  : (msg.content.includes('Sorry, I could not generate a response.') || msg.content.includes('error contacting Amar AI'))
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-900 whitespace-pre-wrap max-w-[95vw] sm:max-w-[80vw] md:max-w-[700px] markdown-body')
              }
              style={msg.role === 'assistant' ? { wordBreak: 'break-word', whiteSpace: 'pre-wrap', display: 'inline-block' } : { wordBreak: 'break-word', display: 'inline-block' }}
            >
              {msg.role === 'assistant' ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeHighlight]}
                  components={{
                    h1: ({node, ...props}) => <h1 className="text-2xl font-bold my-4" {...props} />,
                    h2: ({node, ...props}) => <h2 className="text-xl font-bold my-3" {...props} />,
                    h3: ({node, ...props}) => <h3 className="text-lg font-bold my-2" {...props} />,
                    p: ({node, ...props}) => <p className="my-2" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside my-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside my-2" {...props} />,
                    li: ({node, ...props}) => <li className="my-1" {...props} />,
                    code: ({node, inline, ...props}) => 
                      inline ? (
                        <code className="bg-gray-200 px-1 py-0.5 rounded" {...props} />
                      ) : (
                        <code className="block bg-gray-800 text-white p-4 rounded-lg my-2 overflow-x-auto" {...props} />
                      ),
                    pre: ({node, ...props}) => <pre className="my-2" {...props} />,
                    blockquote: ({node, ...props}) => (
                      <blockquote className="border-l-4 border-gray-300 pl-4 my-2 italic" {...props} />
                    ),
                    table: ({node, ...props}) => (
                      <div className="overflow-x-auto my-4">
                        <table className="min-w-full border-collapse border border-gray-300" {...props} />
                      </div>
                    ),
                    th: ({node, ...props}) => (
                      <th className="border border-gray-300 px-4 py-2 bg-gray-100" {...props} />
                    ),
                    td: ({node, ...props}) => (
                      <td className="border border-gray-300 px-4 py-2" {...props} />
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              ) : (
                msg.content
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="self-start">
            <div className="inline-block px-4 py-2 rounded-2xl bg-gray-100 text-gray-900 animate-pulse">
              Amar AI is thinking…
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSend} className="flex items-center gap-2 p-4 bg-transparent rounded-b-xl">
        <div className="flex flex-1 items-center bg-gray-50 border border-gray-200 rounded-full shadow-sm px-4 py-2 sm:px-6 sm:py-3 focus-within:ring-2 focus-within:ring-primary transition">
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
          <VoiceInput onTranscript={handleTranscript} setInput={setInput} />
        </div>
      </form>
    </div>
  );
} 