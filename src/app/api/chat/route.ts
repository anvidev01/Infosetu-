import { NextResponse } from 'next/server';
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { HuggingFaceInference } from "@langchain/community/llms/hf"; 
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";

// Custom document formatter
const formatDocumentsAsString = (documents: any[]) => {
  return documents.map(doc => doc.pageContent).join("\n\n");
};

// Initialize components
let vectorStore: FaissStore | null = null;
let retriever: any = null;

async function initializeVectorStore() {
  if (!vectorStore) {
    try {
      const embeddings = new HuggingFaceTransformersEmbeddings({
        model: "Xenova/all-MiniLM-L6-v2"
      });
      
      vectorStore = await FaissStore.load("vector_store", embeddings);
      retriever = vectorStore.asRetriever();
      console.log("Vector store loaded successfully");
    } catch (error) {
      console.error("Failed to load vector store:", error);
      throw error;
    }
  }
  return retriever;
}

const llm = new HuggingFaceInference({
  model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
  apiKey: process.env.HUGGINGFACE_API_TOKEN,
  temperature: 0.7,
});

const promptTemplate = `
You are "InfoSetu", an AI assistant for Indian government services.
Answer the user's question based *only* on the "Context" provided.
If the context doesn't have the answer, say "I'm sorry, I don't have information on that topic. I can help with PM-KISAN, Aadhaar, pension, and other government services."
Be helpful, concise, and polite.

Context:
{context}

Question:
{question}

Helpful Answer:
`;

const prompt = PromptTemplate.fromTemplate(promptTemplate);

export async function POST(request: Request) {
  try {
    const { message, language } = await request.json(); 
    console.log("Received query:", message);
    
    // Initialize vector store
    const retriever = await initializeVectorStore();
    
    // Build chain
    const chain = RunnableSequence.from([
      {
        context: async (input: { question: string }) => {
          const docs = await retriever.invoke(input.question);
          console.log(`Retrieved ${docs.length} documents`);
          return formatDocumentsAsString(docs);
        },
        question: (input: { question: string }) => input.question,
      },
      prompt,
      llm,
    ]);

    const response = await chain.invoke({
      question: message
    });
    
    console.log("AI Response:", response);
    return NextResponse.json({ response });

  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { 
        response: "I'm sorry, I'm having trouble retrieving that information right now. Please try again later."
      },
      { status: 500 }
    );
  }
}