# 📘 App Specification: Amar AI – Education Assistant for Bangladesh

## 🎯 Goal

The goal of this project is to build a web-based AI assistant named **Amar AI**, designed to help students across Bangladesh by answering questions based on the national curriculum. The assistant should feel conversational and intelligent, delivering responses that are contextually accurate, curriculum-aligned, and supportive of student learning goals.

## 💡 Core Concept

Amar AI will act as a friendly study companion, appearing as a chat interface where students can ask questions and receive intelligent responses. Behind the scenes, it leverages **OpenAI’s ChatGPT API** for language understanding and generation.

The web interface should be modern, fast, and mobile-friendly, using **Next.js** with **Tailwind CSS** for styling and UI.

## 📚 Target Audience

* Primary, secondary, and higher secondary students in Bangladesh
* Students preparing for public exams (PSC, JSC, SSC, HSC)
* Bengali and English medium curriculum learners

## 🧠 AI Capability

* Powered by OpenAI (e.g., GPT-4.5 or GPT-4 API)
* Acts as if it has access to the entire set of **Bangladeshi school textbooks**
* Responds clearly in both **English and Bengali**
* Should handle questions across all subjects: Math, Science, Bangla, English, ICT, etc.

## 🌐 Frontend

* Built using **Next.js (latest version)** with **App Router**
* Styled with **Tailwind CSS** and latest utility features
* Uses **React Server Components (RSC)** where needed for performance
* Responsive design for desktop and mobile
* Theme: Clean, accessible, and student-friendly
* Core Component: A persistent Chat Interface

## 🛠️ Backend

* Uses **OpenAI’s API** via a lightweight backend (e.g., `/api/chat` route or separate server)
* Manages chat sessions and queries

## 🔒 Privacy & Safety

* No login required (MVP)
* Anonymous, safe for children
* Content filters for age-appropriate responses

## 🔗 Docs & Resources

Here are the official docs for the technologies used:

* **Next.js (App Router)**
  [https://nextjs.org/docs/app](https://nextjs.org/docs/app)

* **OpenAI API (GPT-4, ChatGPT)**
  [https://platform.openai.com/docs/guides/gpt](https://platform.openai.com/docs/guides/gpt)

* **Tailwind CSS (latest)**
  [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
  v2: https://v2.tailwindcss.com/docs