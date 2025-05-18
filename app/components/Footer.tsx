"use client";
import React, { useMemo } from 'react';

export default function Footer() {
  const year = useMemo(() => new Date().getFullYear(), []);
  return (
    <footer className="w-full text-center text-sm text-gray-400 py-6 mt-12">
      <div>By Students For Students | © {year} Amar AI</div>
      <div>Developed by <a href="https://fatinhasnat.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-orange-500">fatinhasnat.com</a></div>
    </footer>
  );
} 