import { NextRequest, NextResponse } from "next/server";
import { RAGEngine } from "@/lib/rag-engine";
import { validateRequest } from "@/lib/guardrails";

// Initialize RAG Engine
const ragEngine = new RAGEngine();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    // Get IP for rate limiting (fallback to 'unknown' if not present)
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // --- GUARDRAILS CHECK ---
    const validation = validateRequest(message, ip);

    if (!validation.valid) {
      // Return a structured response that ChatInterface can display nicely
      return NextResponse.json({
        answer: `🚫 **${validation.error}**\n\nFor your safety, InfoSetu does not process messages containing personal information.`,
        citations: [],
        source: "guardrail_block"
      }); // Returning 200 OK so frontend displays it as a message, or 400 if we want it to be an error. 
      // 200 is better for "chat" flow so it appears in the thread.
    }

    // Extract language (default to 'en')
    const language = body.language || 'en';

    // Use sanitized text
    const response = await ragEngine.query(validation.sanitizedText || message, language);

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in chat route:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}