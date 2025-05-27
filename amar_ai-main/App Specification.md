# 📘 App Specification: **Amar AI – Education Assistant for Bangladesh**

## 🎯 Goal

The goal of this project is to build a web-based AI assistant named **Amar AI**, designed to help students across Bangladesh by answering questions based on the **national curriculum**. The assistant should feel conversational and intelligent, delivering responses that are **contextually accurate, curriculum-aligned**, and supportive of student learning goals.

---

## 💡 Core Concept

**Amar AI** will act as a **friendly study companion**, appearing as a chat interface where students can ask questions and receive intelligent responses. Behind the scenes, it uses **Groq's hosted Mistral models** for language generation.

The web interface should be **modern, fast, and mobile-friendly**, using **Next.js** with **Tailwind CSS** for styling.

---

## 📚 Target Audience

* Primary, secondary, and higher secondary students in Bangladesh
* Students preparing for national exams: **PSC, JSC, SSC, HSC**
* Bengali and English medium curriculum learners

---

## 🧠 AI Capability

* **Powered by Groq API** (uses Mistral models)
* Responds in both **English** and **Bangla**
* Acts as if it has access to **BD government textbooks**
* Supports core subjects: Bangla, English, Math, Science, ICT, etc.
* Aligns with the **NCTB curriculum**
* Initial prompt should guide the AI to be:

  > “You are Amar AI, a helpful assistant for Bangladeshi students. Answer clearly, in English or Bangla, and align with the Bangladesh national curriculum.”

---

## 🌐 Frontend

* Framework: [**Next.js 15**](https://nextjs.org/docs/app) with App Router
* Styling: [**Tailwind CSS**](https://tailwindcss.com/docs)
* Responsive UI: Works well on mobile and desktop
* Modern UX with:

  * React Server Components (RSC)
  * Fast-loading chat UI
  * Minimalist, friendly student design
* Core UI Element: Persistent **chat interface**

---

## 🛠️ Backend

* API route at `/api/chat` or external server
* Communicates with **Groq’s Mistral model** via their API
* Handles user questions and returns streaming AI responses
* No need for database or login (MVP phase)


## 🔒 Privacy & Safety

* **No login required** for MVP
* Anonymous usage
* Must be **safe for children** (school-friendly language)
* Add optional content filters if needed

---

## 🔗 Docs & Resources

* **Next.js (App Router)**
  [https://nextjs.org/docs/app](https://nextjs.org/docs/app)

* **Groq API (Fast inference via Mistral)**
  [https://console.groq.com/docs](https://console.groq.com/docs)

* **Tailwind CSS**
  [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
  [https://v2.tailwindcss.com/docs](https://v2.tailwindcss.com/docs) (legacy)

  Vapi Docs: https://docs.vapi.ai/quickstart/dashboard