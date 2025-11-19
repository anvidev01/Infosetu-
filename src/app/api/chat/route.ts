// src/app/api/chat/route.ts
import { NextResponse } from 'next/server';
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { isTransactionalQuery, getSafetyResponse } from '@/lib/safety-check';

// Initialize embeddings (local)
const embeddings = new HuggingFaceTransformersEmbeddings({
  model: "Xenova/all-MiniLM-L6-v2",
});

// PAYG AI Provider - Replicate (Mistral-7B)
async function getAIResponse(userQuery: string, context: string) {
  try {
    // Check if Replicate API key is available and valid
    if (!process.env.REPLICATE_API_TOKEN || process.env.REPLICATE_API_TOKEN === 'your_replicate_key_here') {
      throw new Error('No valid API key configured');
    }

    const replicate = (await import("replicate")).default;
    const replicateClient = new replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    console.log('🤖 Using PAYG AI (Replicate)...');
    
    const response = await replicateClient.run(
      "mistralai/mistral-7b-instruct-v0.2",
      {
        input: {
          prompt: `You are InfoSetu, an AI assistant for Indian government services. Provide accurate, helpful information based ONLY on the verified context below.

VERIFIED CONTEXT FROM OFFICIAL SOURCES:
${context}

USER QUESTION: ${userQuery}

IMPORTANT RULES:
1. Answer ONLY using information from the verified context above
2. If context doesn't have the answer, say "I don't have verified information about this yet"
3. Never make up or hallucinate information
4. Provide clear, structured response with emojis
5. Include eligibility, documents, process, and benefits where available
6. Mention official websites and helplines

Response:`,
            max_new_tokens: 800,
            temperature: 0.1, // Low temperature for accuracy
            top_p: 0.9,
        }
      }
    );
    
    return {
      response: response,
      aiUsed: true,
      provider: "Replicate (Mistral-7B)",
      cost: "~₹0.045 per query"
    };
    
  } catch (error) {
    console.log('PAYG AI failed, using local enhanced responses:', error);
    return {
      response: null,
      aiUsed: false,
      provider: "Local Enhanced Responses",
      cost: "₹0.00"
    };
  }
}

// Enhanced local responses fallback
const ENHANCED_RESPONSES = {
  'pm-kisan': `👨‍🌾 **PM-KISAN Scheme** 

💰 **Financial Benefits:**
• ₹6,000 per year to eligible farmer families
• Paid in 3 equal installments of ₹2,000
• Direct bank transfer - no middlemen

📋 **Eligibility Criteria:**
• Small and marginal farmer families
• Combined landholding up to 2 hectares
• Valid land records required
• Bank account mandatory

📄 **Required Documents:**
• Land records and ownership proof
• Aadhaar card of all family members  
• Bank account details
• Identity proof (Voter ID, PAN, etc.)

📍 **Application Process:**
1. Visit Common Service Centers (CSCs)
2. Use PM-KISAN mobile application
3. Contact local agriculture office
4. Online through PM-KISAN portal

⏰ **Payment Schedule:**
• 1st Installment: April - July
• 2nd Installment: August - November  
• 3rd Installment: December - March

📞 **Helpline:** 155261 / 1800115526
🔗 **Official Website:** https://pmkisan.gov.in

💡 **Source:** Verified data from pmkisan.gov.in`,

  'aadhaar': `🆔 **Aadhaar Services**

🔧 **Services Available:**
• New enrollment and registration
• Document updates and corrections  
• Biometric updates (fingerprints, iris)
• e-Aadhaar download and printing
• Aadhaar linking with bank, mobile, etc.

📋 **Required Documents:**

**Proof of Identity (Any one):**
• Passport • PAN Card • Driving License
• Government ID • Pension document

**Proof of Address (Any one):**
• Bank Statement • Utility bill (electricity, water)
• Property tax receipt • Rental agreement

**Date of Birth Proof:**
• Birth certificate • School certificate
• PAN card • Passport

📍 **Application Process:**
1. Locate nearest Aadhaar enrollment center
2. Book appointment online at uidai.gov.in
3. Walk-in with required documents
4. Complete biometric registration
5. Receive acknowledgment slip

⏰ **Processing Time:**
• New enrollment: 90 days for Aadhaar delivery
• Update requests: 30 days for updated Aadhaar
• e-Aadhaar: Instant download available

📞 **Helpline:** 1947
🔗 **Official Portal:** https://uidai.gov.in

💡 **Source:** Verified data from uidai.gov.in`,

  'pension': `👵 **Government Pension Schemes**

🏛️ **Major Pension Schemes:**

**1. National Social Assistance Programme (NSAP)**
• Indira Gandhi National Old Age Pension Scheme (IGNOAPS)
• Indira Gandhi National Widow Pension Scheme (IGNWPS) 
• Indira Gandhi National Disability Pension Scheme (IGNDPS)

**2. Atal Pension Yojana (APY)**
• For unorganized sector workers
• Guaranteed pension after 60 years
• Fixed pension from ₹1000 to ₹5000 per month

**3. Employees' Pension Scheme (EPS)**
• For organized sector employees
• Employer-employee contribution based
• Pension based on salary and service period

💰 **Eligibility Criteria:**
• Age 60+ years for most schemes
• Below Poverty Line (BPL) status
• Specific age and income criteria per scheme
• Disability certificate for disability pension

📄 **Required Documents:**
• Age proof certificate
• Income certificate
• Bank account details
• Identity proof (Aadhaar, Voter ID)
• Recent passport photographs
• BPL card (if applicable)

📍 **Application Process:**
1. Visit local social welfare office
2. Apply through Common Service Centers
3. Online application for some schemes
4. Submit required documents with application

💵 **Benefit Amount:**
• Varies by scheme from ₹300 to ₹5000 monthly
• Direct bank transfer
• Regular monthly payments

📞 **Helpline:** 1800115525
🔗 **Official Portal:** https://nsap.nic.in

💡 **Source:** Verified data from nsap.nic.in`
};

export async function POST(request: Request) {
  const startTime = Date.now();
  
  try {
    const { message } = await request.json();
    console.log('🤖 Processing query:', message);

    // Phase B: Safety Check - Block transactional queries
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

    // Phase B: Retrieval - Try vector database first
    let relevantDocs = [];
    try {
      const vectorStore = await FaissStore.load("./vector_store", embeddings);
      relevantDocs = await vectorStore.similaritySearch(message, 3);
      console.log('🔍 Found relevant documents:', relevantDocs.length);
      
    } catch (dbError) {
      console.log('Vector database unavailable, using fallback data');
      // Fallback to basic keyword matching
      relevantDocs = getFallbackDocs(message);
    }

    if (relevantDocs.length === 0) {
      return NextResponse.json({
        response: `🇮🇳 **Welcome to InfoSetu!** 

I can help you with verified information about:

• 👨‍🌾 PM-KISAN Scheme - Farmer financial assistance
• 🆔 Aadhaar Services - Identity verification  
• 👵 Pension Schemes - Social security for elderly

Please ask about any specific scheme for detailed information! 💡`,
        source: "InfoSetu AI Assistant",
        usage: { 
          documents: 0, 
          processingTime: Date.now() - startTime,
          aiProvider: "Local Knowledge Base"
        }
      });
    }

    // Phase B: Augmentation & Generation
    const bestMatch = relevantDocs[0];
    const schemeId = bestMatch.metadata?.id || 'general';

    // Build context from relevant documents
    const context = relevantDocs.map(doc => doc.pageContent).join('\n\n');
    
    // PAYG AI Call (will fallback to local if no API key)
    const aiResult = await getAIResponse(message, context);

    let finalResponse: string;
    
    if (aiResult.response && aiResult.aiUsed) {
      // Use PAYG AI response
      finalResponse = `${aiResult.response}\n\n---\n*🤖 Powered by ${aiResult.provider} | Cost: ${aiResult.cost}*`;
    } else {
      // Use enhanced local response
      finalResponse = ENHANCED_RESPONSES[schemeId as keyof typeof ENHANCED_RESPONSES] || 
                     `🏛️ **Government Service Information**\n\n${bestMatch.pageContent}\n\n💡 *Powered by InfoSetu Local AI*`;
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
        safetyChecked: true
      }
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    
    return NextResponse.json({
      response: `🇮🇳 **Welcome to InfoSetu!** 

I specialize in verified Indian government services information:

• 👨‍🌾 PM-KISAN - Farmer financial support
• 🆔 Aadhaar - Identity services  
• 👵 Pension - Social security schemes

Please ask me about any specific government service! 🚀`,
      source: "InfoSetu Government Services",
      usage: {
        processingTime: Date.now() - startTime,
        aiProvider: "Fallback System",
        cost: "₹0.00"
      }
    });
  }
}

// Fallback when vector database is unavailable
function getFallbackDocs(query: string): any[] {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('pmkisan') || lowerQuery.includes('farmer') || lowerQuery.includes('kisan')) {
    return [{ pageContent: ENHANCED_RESPONSES['pm-kisan'], metadata: { id: 'pm-kisan' } }];
  }
  if (lowerQuery.includes('aadhaar') || lowerQuery.includes('uidai') || lowerQuery.includes('enrollment')) {
    return [{ pageContent: ENHANCED_RESPONSES['aadhaar'], metadata: { id: 'aadhaar' } }];
  }
  if (lowerQuery.includes('pension') || lowerQuery.includes('elderly') || lowerQuery.includes('old age')) {
    return [{ pageContent: ENHANCED_RESPONSES['pension'], metadata: { id: 'pension' } }];
  }
  
  return [];
}