// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { isTransactionalQuery, getSafetyResponse } from '@/lib/safety-check';

// Initialize embeddings (local)
const embeddings = new HuggingFaceTransformersEmbeddings({
  model: "Xenova/all-MiniLM-L6-v2",
});

// 🆕 TAVILY CONFIGURATION - Government Domain Restriction
const TAVILY_CONFIG = {
  apiKey: process.env.TAVILY_API_KEY,
  includeDomains: [
    "gov.in",
    "nic.in", 
    "uidai.gov.in",
    "pmkisan.gov.in",
    "nsap.nic.in",
    "pmuy.gov.in",
    "india.gov.in",
    "mygov.in",
    "dbtagriculture.gov.in",
    "rbi.org.in",
    "incometaxindia.gov.in",
    "dbtbharat.gov.in",
    "eservices.tn.gov.in",
    "mahakosh.gov.in"
  ],
  excludeDomains: [
    "wikipedia.org",
    "blogspot.com",
    "wordpress.com",
    "medium.com",
    "quora.com",
    "reddit.com"
  ]
};

// 🆕 SIMILARITY THRESHOLD - Gatekeeper against "Confident Liar"
const SIMILARITY_THRESHOLD = 0.7;

// 🆕 AGENTIC WEB SEARCH FALLBACK
async function searchOfficialGovernmentSources(query: string): Promise<{context: string, sources: string[]}> {
  try {
    if (!process.env.TAVILY_API_KEY) {
      console.log('❌ Tavily API key not configured');
      return {
        context: 'Web search not available. Please check official government websites directly.',
        sources: []
      };
    }

    console.log('🔍 Searching official government sources for:', query);
    
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: process.env.TAVILY_API_KEY,
        query: `Indian government ${query} scheme eligibility benefits application process`,
        search_depth: 'advanced',
        include_domains: TAVILY_CONFIG.includeDomains,
        exclude_domains: TAVILY_CONFIG.excludeDomains,
        max_results: 3,
        include_raw_content: true,
        include_answer: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Tavily API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return {
        context: `No official information found for "${query}" in government sources. Please visit official websites.`,
        sources: []
      };
    }

    // 🛡️ SAFETY CHECK: Verify all results are from official domains
    const officialResults = data.results.filter((result: any) => 
      TAVILY_CONFIG.includeDomains.some(domain => result.url.includes(domain))
    );

    if (officialResults.length === 0) {
      return {
        context: `No verified government information found for "${query}". Please check official websites directly.`,
        sources: []
      };
    }

    // Format context from official sources
    const sources = officialResults.map((result: any) => result.url);
    const context = officialResults.map((result: any, index: number) => 
      `[Source ${index + 1}: ${new URL(result.url).hostname}]\n${result.content}`
    ).join('\n\n');

    console.log('✅ Found official information from', officialResults.length, 'sources');
    return { context, sources };

  } catch (error: any) {
    console.error('❌ Web search failed:', error.message);
    
    // Handle specific error cases
    if (error.message.includes('401') || error.message.includes('Invalid API key')) {
      return {
        context: 'Search service temporarily unavailable. Please check official government websites.',
        sources: []
      };
    }
    
    if (error.message.includes('429') || error.message.includes('rate limit')) {
      return {
        context: 'Search limit reached. Please try again later or visit government websites directly.',
        sources: []
      };
    }
    
    return {
      context: 'Unable to search official sources at the moment. Please try again later.',
      sources: []
    };
  }
}

// 🆕 IMPROVED VECTOR SEARCH WITH CONFIDENCE SCORING
async function getConfidentVectorResults(query: string, threshold: number = SIMILARITY_THRESHOLD) {
  try {
    const vectorStore = await FaissStore.load("./vector_store", embeddings);
    const results = await vectorStore.similaritySearchWithScore(query, 3);
    
    // Filter by confidence threshold
    const confidentResults = results.filter(([doc, score]) => score >= threshold);
    
    console.log(`📊 Vector search: ${results.length} total, ${confidentResults.length} above threshold (${threshold})`);
    
    return {
      documents: confidentResults.map(([doc, score]) => ({
        pageContent: doc.pageContent,
        metadata: doc.metadata,
        confidence: score
      })),
      hasConfidentMatches: confidentResults.length > 0,
      highestScore: results.length > 0 ? results[0][1] : 0
    };
    
  } catch (error) {
    console.log('❌ Vector database unavailable');
    return {
      documents: [],
      hasConfidentMatches: false,
      highestScore: 0
    };
  }
}

// 🆕 ENHANCED AI RESPONSE GENERATION
async function getAIResponse(userQuery: string, context: string, sourceType: 'vector' | 'web', sources: string[] = []) {
  try {
    const prompt = `You are "Infosetu Mitra" - a trusted Indian government assistant. Respond in natural Hinglish.

CRITICAL SAFETY RULES:
1. 🔒 USE ONLY the verified context below - NEVER invent information
2. 🌍 Respond in warm, helpful Hinglish with "Aap", "Ji", "Dekhiye"
3. 📚 Provide step-by-step explanations with practical examples
4. 🏛️ Be accurate and factual - this is for government services
5. ❌ If context doesn't contain answer, politely direct to official sources

CONTEXT FROM ${sourceType === 'vector' ? 'VERIFIED DATABASE' : 'OFFICIAL GOVERNMENT WEBSITES'}:
${context}

USER QUESTION: ${userQuery}

Response in helpful Hinglish:`;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:3b',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.3, // Lower temperature for factual responses
          num_predict: 800,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`AI service error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Add source attribution for web searches
    let finalResponse = data.response;
    if (sourceType === 'web' && sources.length > 0) {
      finalResponse += `\n\n📚 *Sources: ${sources.slice(0, 2).map(url => new URL(url).hostname).join(', ')}*`;
    }
    
    return {
      response: finalResponse,
      aiUsed: true,
      provider: `Local Ollama + ${sourceType === 'vector' ? 'Verified Database' : 'Official Web Search'}`,
      cost: "₹0.00 (Free)",
      source: sourceType
    };
    
  } catch (error: any) {
    console.log('❌ AI service failed:', error.message);
    return {
      response: null,
      aiUsed: false,
      provider: "Local Enhanced Responses", 
      cost: "₹0.00",
      source: 'fallback'
    };
  }
}

// Enhanced local responses (keep your existing ones)
const ENHANCED_RESPONSES = {
  // ... your existing responses
};

export async function POST(request: Request) {
  const startTime = Date.now();
  
  try {
    const { message, chatHistory = [] } = await request.json();
    console.log('🤖 Processing query:', message);

    // Safety Check
    if (isTransactionalQuery(message)) {
      return NextResponse.json({
        response: getSafetyResponse(message),
        source: "Security System",
        usage: {
          processingTime: Date.now() - startTime,
          safetyCheck: "blocked"
        }
      });
    }

    // 🆕 AGENTIC RAG FLOW
    let context = '';
    let sourceType: 'vector' | 'web' | 'fallback' = 'fallback';
    let confidence = 0;
    let sources: string[] = [];
    
    // Step 1: Try Vector Database with Confidence Threshold
    const vectorResults = await getConfidentVectorResults(message);
    confidence = vectorResults.highestScore;
    
    if (vectorResults.hasConfidentMatches) {
      // ✅ High confidence match found
      context = vectorResults.documents.map(doc => doc.pageContent).join('\n\n');
      sourceType = 'vector';
      console.log('✅ Using confident vector match');
      
    } else if (confidence > 0.3 && confidence < SIMILARITY_THRESHOLD) {
      // ⚠️ Low confidence - Potential "Confident Liar" scenario
      console.log('⚠️ Low confidence match - preventing hallucination');
      context = `I don't have verified information about this in my database. Let me search official sources...`;
      sourceType = 'fallback';
      
    } else {
      // ❌ No confident matches - Use Agentic Web Search
      console.log('🔍 No confident matches - searching official sources');
      const webResults = await searchOfficialGovernmentSources(message);
      context = webResults.context;
      sources = webResults.sources;
      sourceType = webResults.sources.length > 0 ? 'web' : 'fallback';
    }

    // Step 2: Generate Response
    let aiResult;
    
    if (sourceType === 'fallback') {
      // Use enhanced local responses for fallback
      const fallbackResponse = getFallbackResponse(message);
      aiResult = {
        response: fallbackResponse,
        aiUsed: false,
        provider: "Local Knowledge Base",
        cost: "₹0.00",
        source: 'fallback'
      };
    } else {
      // Use AI with the retrieved context
      aiResult = await getAIResponse(message, context, sourceType, sources);
    }

    let finalResponse: string;
    
    if (aiResult.response && aiResult.aiUsed) {
      finalResponse = aiResult.response;
    } else {
      finalResponse = aiResult.response || getFallbackResponse(message);
    }

    return NextResponse.json({
      response: finalResponse,
      source: sourceType === 'web' ? "Official Government Websites" : 
              sourceType === 'vector' ? "Verified Database" : "Local Knowledge Base",
      confidence: confidence,
      sources: sources,
      usage: {
        processingTime: Date.now() - startTime,
        aiProvider: aiResult.provider,
        cost: aiResult.cost,
        safetyChecked: true,
        sourceType: sourceType,
        similarityScore: confidence,
        thresholdUsed: SIMILARITY_THRESHOLD,
        webSourcesUsed: sources.length
      }
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    
    return NextResponse.json({
      response: getFallbackResponse(""),
      source: "Infosetu Government Services",
      usage: {
        processingTime: Date.now() - startTime,
        aiProvider: "Fallback System",
        cost: "₹0.00"
      }
    });
  }
}

// Helper functions (keep your existing ones)
function getFallbackResponse(query: string): string {
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes('ujjwala') || lowerQuery.includes('lpg') || lowerQuery.includes('gas')) {
    return `🔥 **Pradhan Mantri Ujjwala Yojana**\n\nMain aapko Ujjwala Yojana ke bare mein basic information de sakta hu:\n\n• BPL families ko free LPG connections\n• Women empowerment aur clean cooking fuel\n• Indoor air pollution reduction\n\nDetailed eligibility aur application process ke liye official website visit karein: https://pmuy.gov.in`;
  }
  // ... your other fallbacks
  return `🇮🇳 **Namaste! Main Infosetu Mitra hu!**\n\nAapki kya madad kar sakta hu? Main in government schemes mein help kar sakta hu:\n• 👨‍🌾 PM-KISAN Scheme\n• 🆔 Aadhaar Services  \n• 👵 Pension Schemes\n• 🔥 Ujjwala Yojana\n\nKoi specific scheme ke bare mein puchiye! 💡`;
}

function getFallbackDocs(query: string): any[] {
  // ... your existing implementation
  return [];
}