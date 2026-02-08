
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { ChatOllama } from "@langchain/ollama";
import { tavily } from "@tavily/core";
import path from "path";

// Define interfaces for our RAG response
export interface RAGResponse {
    answer: string;
    source: "vector_store" | "tavily_search" | "llm_direct";
    citations: Array<{
        title: string;
        url?: string;
        content: string;
    }>;
}

export type Language = 'en' | 'hi' | 'bn' | 'mr' | 'te' | 'hinglish';

const PROMPTS: Record<Language, string> = {
    en: "You are an official government assistant. Respond strictly in English. Maintain a formal, helpful tone.",
    hi: "आप एक आधिकारिक सरकारी सहायक हैं। कृपया उत्तर केवल हिंदी (देवनागरी लिपि) में दें। औपचारिक और सहायक लहज़ा बनाए रखें।",
    bn: "আপনি একজন সরকারি সহায়ক। দয়া করে উত্তর শুধুমাত্র বাংলায় দিন। আনুষ্ঠানিক এবং সহায়ক সুর বজায় রাখুন।",
    mr: "तुम्ही एक अधिकृत सरकारी सहाय्यक आहात. कृपया उत्तर फक्त मराठीत द्या. औपचारिक आणि मदतीचा सूर ठेवा.",
    te: "మీరు ప్రభుత్వ సహాయకులు. దయచేసి సమాధానం తెలుగులో మాత్రమే ఇవ్వండి. అధికారిక మరియు సహాయక ధోరణిని కొనసాగించండి.",
    hinglish: "You are an official government assistant. Respond in Hinglish. Use Devanagari script for conversational Hindi text, but keep technical terms (like 'Aadhaar', 'Scheme', 'Apply') strictly in English (Latin script). Example: 'Aadhaar Card ke liye apply karein'."
};

export class RAGEngine {
    private vectorStorePath: string;
    private embeddings: HuggingFaceTransformersEmbeddings;
    private llm: ChatOllama;
    private tavilyClient: any; // Using any for now as @tavily/core types might vary
    private isInitialized: boolean = false;
    private vectorStore: FaissStore | null = null;

    // Configuration
    private SIMILARITY_THRESHOLD = 0.7; // As per requirements
    private LLM_MODEL = "llama3.2:3b";
    private TAVILY_DOMAINS = [".gov.in", ".nic.in"];

    constructor() {
        this.vectorStorePath = path.join(process.cwd(), "vector_store");

        // Initialize Embeddings
        this.embeddings = new HuggingFaceTransformersEmbeddings({
            model: "Xenova/all-MiniLM-L6-v2",
        });

        // Initialize Ollama
        this.llm = new ChatOllama({
            baseUrl: "http://localhost:11434", // Default Ollama URL
            model: this.LLM_MODEL,
            temperature: 0.1, // Lower temperature for more deterministic translations
        });

        // Initialize Tavily
        const apiKey = process.env.TAVILY_API_KEY;
        if (apiKey) {
            this.tavilyClient = tavily({ apiKey });
        } else {
            console.warn("TAVILY_API_KEY is not set. Fallback search will not work.");
        }
    }

    // Lazy initialization of the vector store
    private async initializeVectorStore() {
        if (this.isInitialized) return;

        try {
            console.log(`Loading vector store from: ${this.vectorStorePath}`);
            this.vectorStore = await FaissStore.load(
                this.vectorStorePath,
                this.embeddings
            );
            this.isInitialized = true;
        } catch (error) {
            console.error("Failed to load vector store:", error);
            // We might proceed without vector store if it fails, relying on Tavily/LLM
            this.vectorStore = null;
        }
    }

    public async query(userMessage: string, language: Language = 'en'): Promise<RAGResponse> {
        await this.initializeVectorStore();

        let context = "";
        let source: "vector_store" | "tavily_search" = "vector_store";
        let citations: any[] = [];

        // 1. Try Vector Search first
        if (this.vectorStore) {
            try {
                // Search for relevant documents with score
                const results = await this.vectorStore.similaritySearchWithScore(userMessage, 3);

                if (results.length > 0) {
                    // We have local context
                    context = results.map(([doc, _]: [any, any]) => doc.pageContent).join("\n\n");
                    citations = results.map(([doc, _]: [any, any]) => doc.metadata);
                    source = "vector_store";
                }
            } catch (err) {
                console.error("Vector search error:", err);
            }
        }

        // 2. Fallback to Tavily if context is empty
        if (!context && this.tavilyClient) {
            try {
                console.log("⚠️ Low confidence or no local results. Falling back to Tavily...");
                const searchResult = await this.tavilyClient.search(userMessage, {
                    search_depth: "advanced",
                    include_domains: this.TAVILY_DOMAINS,
                    max_results: 3
                });

                if (searchResult.results && searchResult.results.length > 0) {
                    context = searchResult.results.map((r: any) => r.content).join("\n\n");
                    citations = searchResult.results.map((r: any) => ({
                        title: r.title,
                        url: r.url,
                        content: r.content.substring(0, 100) + "..."
                    }));
                    source = "tavily_search";
                }
            } catch (err) {
                console.error("Tavily search error:", err);
            }
        }

        // 3. Generate Response using Ollama with Language Dynamic Prompt
        const languageInstruction = PROMPTS[language] || PROMPTS['en'];

        const systemPrompt = `You are InfoSetu, a vital government service assistant for India.
${languageInstruction}

STRICT INSTRUCTIONS:
1. Use the provided Context ONLY. If the Answer is not in the context, politely say you don't know in the target language.
2. The Context is provided in English/Hindi. You MUST TRANSLATE and SYNTHESIZE the answer into the target language defined above.
3. Be polite, formal, and accurate.
4. Keep the answer concise.

CONTEXT:
${context}

USER QUESTION:
${userMessage}
`;

        try {
            const response = await (this.llm as any).invoke([
                ["system", systemPrompt],
                ["human", userMessage]
            ]);

            return {
                answer: response.content.toString(),
                source: source,
                citations: citations
            };
        } catch (err) {
            console.error("LLM generation error:", err);
            return {
                answer: "System Error. Please try again later.",
                source: "llm_direct",
                citations: []
            };
        }
    }
}
