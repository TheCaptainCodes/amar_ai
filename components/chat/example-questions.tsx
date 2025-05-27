"use client";

import React from 'react';

const examples = [
  'What is the formula for solving a quadratic equation?',
  'স্থির বিদ্যুৎ সহজভাবে বোঝাও',
  'Who is the writer of "Shubha"?',
  'মাইটোসিস কোষ বিবভজন কাকে বলে?',
  'Explain the laws of motion in Bangla',
];

const mobileExamples = [
  'স্থির বিদ্যুৎ সহজভাবে বোঝাও',
  'Who is the writer of "Shubha"?',
  'মাইটোসিস কোষ বিবভজন কাকে বলে?',
];

export default function ExampleQuestions({ onSelect }: { onSelect: (q: string) => void }) {
  return (
    <div className="mt-0 flex flex-col items-center space-y-2">
      <div className="text-gray-900 mb-2 font-semibold">Try asking:</div>
      <div className="flex flex-wrap gap-2 justify-center">
        {examples.map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className={`bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full px-4 py-2 text-sm transition border border-gray-200 cursor-pointer hover:shadow-md hover:scale-105 ${!mobileExamples.includes(q) ? 'hidden sm:block' : ''}`}
            style={{ transition: 'all 0.15s' }}
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
} 