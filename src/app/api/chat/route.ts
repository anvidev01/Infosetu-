import { NextResponse } from 'next/server';
import { HuggingFaceInference } from "@langchain/community/llms/hf"; 

// Official government data from authentic sources
const officialGovernmentData = [
  {
    content: "PM-KISAN Scheme: Provides ₹6,000 per year in 3 installments to farmer families with landholding up to 2 hectares. Official website: pmkisan.gov.in",
    source: "https://pmkisan.gov.in",
    type: "farmer_scheme"
  },
  {
    content: "Aadhaar Services: Enrollment requires proof of identity, address, and date of birth. Update services available at uidai.gov.in or Aadhaar centers. Official portal: uidai.gov.in",
    source: "https://uidai.gov.in",
    type: "identity_service"
  },
  {
    content: "Digital Ration Card: Apply through state food department portals or Common Service Centers. Required: Aadhaar, address proof, income certificate. Part of National Food Security Act.",
    source: "https://nfsa.gov.in",
    type: "food_security"
  },
  {
    content: "Ayushman Bharat PM-JAY: Health insurance coverage of ₹5 lakhs per family annually. Eligibility based on SECC data. Official website: pmjay.gov.in",
    source: "https://pmjay.gov.in",
    type: "health_insurance"
  },
  {
    content: "National Pension Scheme: Open to all citizens aged 18-70. Minimum contribution ₹500/month. Official portal: npscra.nsdl.co.in",
    source: "https://npscra.nsdl.co.in",
    type: "pension_scheme"
  },
  {
    content: "MNREGA: Guarantees 100 days of wage employment per rural household. Minimum wages vary by state. Official website: nrega.nic.in",
    source: "https://nrega.nic.in",
    type: "employment_scheme"
  }
];

// Simple vector similarity using embeddings
function findMostRelevantDocuments(query: string, documents: any[], topK: number = 3) {
  const queryWords = query.toLowerCase().split(' ');
  
  return documents
    .map(doc => {
      const docWords = doc.content.toLowerCase();
      let score = 0;
      
      queryWords.forEach(word => {
        if (docWords.includes(word)) {
          score += 2; // Exact word match
        } else if (word.length > 3) {
          // Partial match for longer words
          const regex = new RegExp(word.slice(0, 3), 'i');
          if (regex.test(docWords)) {
            score += 1;
          }
        }
      });
      
      // Boost score if query contains specific scheme names
      if (query.toLowerCase().includes('aadhaar') && doc.type === 'identity_service') score += 5;
      if (query.toLowerCase().includes('pm-kisan') && doc.type === 'farmer_scheme') score += 5;
      if (query.toLowerCase().includes('ration') && doc.type === 'food_security') score += 5;
      if (query.toLowerCase().includes('health') && doc.type === 'health_insurance') score += 5;
      if (query.toLowerCase().includes('pension') && doc.type === 'pension_scheme') score += 5;
      if (query.toLowerCase().includes('employment') && doc.type === 'employment_scheme') score += 5;
      
      return { ...doc, score };
    })
    .filter(doc => doc.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

export async function POST(request: Request) {
  try {
    const { message, language } = await request.json();
    
    // Find relevant official documents
    const relevantDocs = findMostRelevantDocuments(message, officialGovernmentData, 3);
    
    if (relevantDocs.length === 0) {
      return NextResponse.json({ 
        response: "I can help you with government services like PM-KISAN, Aadhaar, Digital Ration Card, Ayushman Bharat, Pension schemes, and employment programs. Please ask about any of these services."
      });
    }

    const context = relevantDocs.map(doc => 
      `${doc.content} [Source: ${doc.source}]`
    ).join('\n\n');

    try {
      // Try using HuggingFace for better responses
      const llm = new HuggingFaceInference({
        model: "mistralai/Mistral-7B-Instruct-v0.2", // Smaller, faster model
        apiKey: process.env.HUGGINGFACE_API_TOKEN,
        temperature: 0.3, // More focused responses
      });

      const prompt = `You are InfoSetu, an official government service assistant. 
      Answer the question using ONLY the provided official information. 
      Be precise and include official website links when available.

      Official Information:
      ${context}

      Question: ${message}

      Answer in a helpful, official manner:`;

      const response = await llm.invoke(prompt);
      return NextResponse.json({ response });

    } catch (llmError) {
      // Fallback to direct response if LLM fails
      const directResponse = relevantDocs[0].content + `\n\nFor more details, visit: ${relevantDocs[0].source}`;
      return NextResponse.json({ response: directResponse });
    }

  } catch (error) {
    console.error("Chat API Error:", error);
    
    // Final fallback
    return NextResponse.json({ 
      response: "I can provide information about Indian government services including Aadhaar, PM-KISAN, Digital Ration Card, Ayushman Bharat health insurance, pension schemes, and employment programs. Please ask about any specific service."
    });
  }
}