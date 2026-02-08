# InfoSetu: Pan-India Government Schemes Assistant

InfoSetu is an advanced AI-powered chatbot designed to make government schemes accessible to every Indian citizen. It features a "Perplexity-style" Answer Engine UI, real-time web search integration, and native multi-regional language support.

## 🚀 Features

-   **Multi-Regional Language Support**: Full support for English, Hindi (हिंदी), Bengali (বাংলা), Marathi (मराठी), Telugu (తెలుగు), and Hinglish.
-   **Answer Engine Design**: A clean, source-cited interface inspired by Perplexity AI.
-   **Secure Agentic RAG**: Combines local vector search (Faiss) with Tavily web search, protected by strict PII guardrails.
-   **Voice Integration**: Talk to InfoSetu in your native language with real-time transcription and TTS.
-   **Document Analysis**: Upload scheme documents for instant OCR-based Q&A.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
-   **LLM**: [Groq Cloud](https://groq.com/) (Llama-3-8b-8192) for blazing fast inference.
-   **Search**: [Tavily AI](https://tavily.com/) for live government data retrieval.
-   **Vector DB**: [Faiss-Node](https://github.com/facebookresearch/faiss) (Running natively on Vercel Serverless).
-   **Styling**: Tailwind CSS + Lucide Icons.

## 🌍 Integration

This project is deployed on **Vercel**.
It uses:
-   `GROQ_API_KEY`: For the Intelligence Layer.
-   `TAVILY_API_KEY`: For the Retrieval Layer.
-   Native Modules (`faiss-node`) configured via `next.config.ts`.

---
*Where knowledge becomes accessible.*
