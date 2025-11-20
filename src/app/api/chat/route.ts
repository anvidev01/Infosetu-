// FILE: src/app/api/chat/route.ts (OPTIMIZED FOR llama3.2:3b)
import { NextResponse } from 'next/server';
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { isTransactionalQuery, getSafetyResponse } from '@/lib/safety-check';

// Initialize embeddings (local)
const embeddings = new HuggingFaceTransformersEmbeddings({
  model: "Xenova/all-MiniLM-L6-v2",
});

// 🆕 OPTIMIZED FOR llama3.2:3b
async function getAIResponse(userQuery: string, context: string, chatHistory: any[] = []) {
  try {
    console.log('🤖 Using Local Llama 3.2 3B via Ollama...');
    
    const prompt = `You are "Infosetu Mitra" - a friendly Indian government assistant. Respond in natural Hinglish (Hindi+English mix).

VERIFIED GOVERNMENT CONTEXT:
${context}

USER QUESTION: ${userQuery}

Respond in warm, helpful Hinglish with step-by-step explanations. Use "Aap", "Ji", "Dekhiye" naturally.`;

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3.2:3b',  // 🆕 CHANGED TO 3B MODEL
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          num_predict: 600,  // Optimized for 3B model
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      response: data.response,
      aiUsed: true,
      provider: "Local Ollama (Llama-3.2-3B)",
      cost: "₹0.00 (Free)"
    };
    
  } catch (error: any) {
    console.log('❌ Local Ollama failed:', error.message);
    return {
      response: null,
      aiUsed: false,
      provider: "Local Enhanced Responses", 
      cost: "₹0.00"
    };
  }
}

// Keep all your existing functions exactly as they were
function shouldUseAI(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  const useAIPatterns = [
    /explain/i, /tell me about/i, /what is/i, /how does/i,
    /benefits/i, /help/i, /guide/i, /information/i, /details/i,
    /understand/i, /complete/i, /overview/i, /kaise/i, /kya/i,
    /process/i, /steps/i, /procedure/i, /eligibility/i,
    /documents? required/i, /apply/i, /registration/i
  ];
  
  const simplePatterns = [
    /helpline$/i, /website$/i, /contact$/i, /phone$/i, /number$/i,
    /email$/i, /address$/i
  ];
  
  const shouldUseAI = useAIPatterns.some(pattern => pattern.test(lowerQuery));
  const isVerySimple = simplePatterns.some(pattern => pattern.test(lowerQuery));
  
  return shouldUseAI || !isVerySimple;
}

const ENHANCED_RESPONSES = {
  'pm-kisan': `Namaste ji! 👨‍🌾 **PM-KISAN Scheme ke bare mein complete jaankari:**

💰 **Financial Benefits:**
• ₹6,000 har saal eligible kisan families ko
• 3 equal installments mein - har ek ₹2,000 ka
• Direct bank transfer - koi bichwaala nahi

📋 **Eligibility Criteria:**
• Chhote aur marginal kisan parivaar
• Combined landholding 2 hectares tak
• Valid land records hona zaroori
• Bank account mandatory hai

Kya aap koi specific document ke bare mein jaanna chahte hain? 🎯`,

  'aadhaar': `Pranam! 🆔 **Aadhaar Services ki poori jaankari:**

🔧 **Available Services:**
• Naya enrollment aur registration
• Document updates aur corrections  
• Biometric updates (fingerprints, iris)
• e-Aadhaar download aur printing

📍 **Kaise Apply Karein:**
1. Nearest Aadhaar enrollment center dhundhein
2. Online appointment book karein uidai.gov.in par
3. Required documents le kar jaayein
4. Biometric registration complete karein

Kya aapko koi specific service ke bare mein jaanna hai? 🤔`,

  'pension': `Namaste ji! 👵 **Government Pension Schemes ki complete guide:**

🏛️ **Major Pension Schemes:**
• National Social Assistance Programme (NSAP)
• Atal Pension Yojana (APY)
• Employees' Pension Scheme (EPS)

💰 **Eligibility Criteria:**
• 60+ saal ki age for most schemes
• Below Poverty Line (BPL) status
• Specific age aur income criteria

Kya aap kisi specific pension scheme ke bare mein jaanna chahte hain? 💡`
};

// Keep your existing POST function and getFallbackDocs exactly as they were
export async function POST(request: Request) {
  const startTime = Date.now();
  
  try {
    const { message, chatHistory = [] } = await request.json();
    console.log('🤖 Processing query:', message);

    if (isTransactionalQuery(message)) {
      console.log('🔒 Blocked transactional query');
      return NextResponse.json({
        response: getSafetyResponse(message),
        source: "Security System",
        usage: {
          processingTime: Date.now() - startTime,
          safetyCheck: "blocked"
        }
      });
    }

    let relevantDocs = [];
    try {
      const vectorStore = await FaissStore.load("./vector_store", embeddings);
      relevantDocs = await vectorStore.similaritySearch(message, 3);
      console.log('🔍 Found relevant documents:', relevantDocs.length);
      
    } catch (dbError) {
      console.log('Vector database unavailable, using fallback data');
      relevantDocs = getFallbackDocs(message);
    }

    if (relevantDocs.length === 0) {
      return NextResponse.json({
        response: `🇮🇳 **Namaste! Main Infosetu Mitra hu!** 
Aapki kya madad kar sakta hu? Main in government schemes mein help kar sakta hu:
• 👨‍🌾 PM-KISAN Scheme
• 🆔 Aadhaar Services  
• 👵 Pension Schemes
Koi specific scheme ke bare mein puchiye! 💡`,
        source: "Infosetu AI Assistant",
        usage: { 
          documents: 0, 
          processingTime: Date.now() - startTime,
          aiProvider: "Local Knowledge Base"
        }
      });
    }

    const bestMatch = relevantDocs[0];
    const schemeId = bestMatch.metadata?.id || 'general';
    const context = relevantDocs.map(doc => doc.pageContent).join('\n\n');
    
    const shouldUseAIResponse = shouldUseAI(message);
    let aiResult;
    
    if (shouldUseAIResponse) {
      console.log('🎯 Using Local Llama 3.2 3B for interactive Hinglish response');
      aiResult = await getAIResponse(message, context, chatHistory);
    } else {
      console.log('💰 Using local response for very simple query');
      aiResult = {
        response: null,
        aiUsed: false,
        provider: "Local (Simple Query)",
        cost: "₹0.00"
      };
    }

    let finalResponse: string;
    
    if (aiResult.response && aiResult.aiUsed) {
      finalResponse = `${aiResult.response}\n\n---\n*🤖 Powered by ${aiResult.provider} | Cost: ${aiResult.cost}*`;
    } else {
      finalResponse = ENHANCED_RESPONSES[schemeId as keyof typeof ENHANCED_RESPONSES] || 
                     `🏛️ **Government Service Information**\n\n${bestMatch.pageContent}\n\n💡 *Infosetu Mitra se poochiye koi aur sawal!*`;
    }

    return NextResponse.json({
      response: finalResponse,
      source: "Verified Government Sources",
      confidence: relevantDocs.length > 1 ? "high" : "medium",
      usage: {
        documents: relevantDocs.length,
        processingTime: Date.now() - startTime,
        aiProvider: aiResult.provider,
        cost: aiResult.cost,
        safetyChecked: true,
        aiRequested: shouldUseAIResponse,
        aiUsed: aiResult.aiUsed
      }
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    
    return NextResponse.json({
      response: `🇮🇳 **Namaste! Main Infosetu Mitra hu!** 
Main Indian government services ki verified information deta hu:
• 👨‍🌾 PM-KISAN - Kisan financial support
• 🆔 Aadhaar - Identity services  
• 👵 Pension - Social security schemes
Koi specific government service ke bare mein poochiye! 🚀`,
      source: "Infosetu Government Services",
      usage: {
        processingTime: Date.now() - startTime,
        aiProvider: "Fallback System",
        cost: "₹0.00"
      }
    });
  }
}

function getFallbackDocs(query: string): any[] {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('pmkisan') || lowerQuery.includes('farmer') || lowerQuery.includes('kisan')) {
    return [{ pageContent: ENHANCED_RESPONSES['pm-kisan'], metadata: { id: 'pm-kisan' } }];
  }
  if (lowerQuery.includes('aadhaar') || lowerQuery.includes('uidai') || lowerQuery.includes('enrollment')) {
    return [{ pageContent: ENHANCED_RESPONSES['aadhaar'], metadata: { id: 'aadhaar' } }];
  }
  if (lowerQuery.includes('pension') || lowerQuery.includes('elderly') || lowerQuery.includes('old age') || lowerQuery.includes('budhape')) {
    return [{ pageContent: ENHANCED_RESPONSES['pension'], metadata: { id: 'pension' } }];
  }
  
  return [];
}