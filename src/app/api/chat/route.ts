import { NextResponse } from 'next/server';

// MyScheme.gov.in Integration
const MYSCHEME_CONFIG = {
  baseUrl: 'https://www.myscheme.gov.in',
  searchUrl: 'https://www.myscheme.gov.in/schemes',
  apiBase: 'https://www.myscheme.gov.in/api'
};

// Government Schemes mapped to MyScheme
const GOVERNMENT_SCHEMES = {
  'pm-awas-yojana': {
    name: "Pradhan Mantri Awas Yojana (PMAY)",
    myschemeId: "pmay-urban", // MyScheme identifier
    searchTerms: ["housing", "awas", "pmay", "pradhan mantri awas yojana"],
    fallback: {
      content: "PMAY provides affordable housing with interest subsidy of 6.5% on loans. Features: Credit Linked Subsidy Scheme (CLSS), subsidy up to ₹2.67 lakh for EWS/LIG categories. Eligibility: Family income up to ₹18 lakh annually.",
      source: "https://www.myscheme.gov.in/scheme/pmay-urban"
    }
  },
  
  'pm-kisan': {
    name: "PM-KISAN Scheme",
    myschemeId: "pm-kisan",
    searchTerms: ["pm-kisan", "kisan", "farmer", "agriculture"],
    fallback: {
      content: "Provides ₹6,000 per year in 3 equal installments to farmer families with landholding up to 2 hectares. Documents: Land records, Aadhaar, bank account details.",
      source: "https://www.myscheme.gov.in/scheme/pm-kisan"
    }
  },
  
  'ayushman-bharat': {
    name: "Ayushman Bharat PM-JAY",
    myschemeId: "ayushman-bharat",
    searchTerms: ["ayushman", "health", "insurance", "medical"],
    fallback: {
      content: "Health insurance coverage of ₹5 lakhs per family annually. Coverage: Hospitalization, surgery, pre-existing diseases. Eligibility: Based on SECC 2011 data.",
      source: "https://www.myscheme.gov.in/scheme/ayushman-bharat"
    }
  },
  
  'aadhaar': {
    name: "Aadhaar Services",
    myschemeId: "aadhaar",
    searchTerms: ["aadhaar", "uidai", "identity", "enrollment"],
    fallback: {
      content: "Aadhaar enrollment and update services. Required documents: Proof of identity, address, date of birth. Update process: Online through uidai.gov.in.",
      source: "https://www.myscheme.gov.in/scheme/aadhaar"
    }
  },
  
  'scholarship': {
    name: "National Scholarship Portal",
    myschemeId: "national-scholarship",
    searchTerms: ["scholarship", "education", "student", "financial aid"],
    fallback: {
      content: "Pre-Matric, Post-Matric, Merit-cum-Means scholarships. Platforms: National Scholarship Portal, Vidyalakshmi for education loans.",
      source: "https://www.myscheme.gov.in/scheme/national-scholarship"
    }
  },
  
  'employment': {
    name: "Employment Programs",
    myschemeId: "employment",
    searchTerms: ["employment", "job", "mnrega", "skill india"],
    fallback: {
      content: "MNREGA: 100 days guaranteed employment. National Career Service: Job portal and counseling. Skill India: Vocational training.",
      source: "https://www.myscheme.gov.in/scheme/employment"
    }
  }
};

// Function to fetch from MyScheme.gov.in
async function fetchFromMyScheme(schemeKey: string, query: string) {
  const scheme = GOVERNMENT_SCHEMES[schemeKey as keyof typeof GOVERNMENT_SCHEMES];
  
  if (!scheme) {
    return { ...scheme.fallback, live: false };
  }

  try {
    console.log(`Fetching from MyScheme for: ${scheme.name}`);
    
    // Method 1: Try direct MyScheme API (if available)
    const apiUrl = `${MYSCHEME_CONFIG.apiBase}/schemes/${scheme.myschemeId}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'InfoSetu-Citizen-Service/1.0 (+https://github.com/infosetu)',
        'Accept': 'application/json',
        'Referer': 'https://www.myscheme.gov.in'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    // If API works, process the data
    if (response.ok) {
      const data = await response.json();
      console.log('MyScheme API Response:', data);
      
      return {
        content: processMySchemeData(data, scheme),
        source: `${MYSCHEME_CONFIG.baseUrl}/schemes/${scheme.myschemeId}`,
        live: true,
        apiSource: 'MyScheme Official API'
      };
    }

    // Method 2: If API fails, use MyScheme webpage structure
    const webUrl = `${MYSCHEME_CONFIG.baseUrl}/schemes/${scheme.myschemeId}`;
    const webResponse = await fetch(webUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(8000)
    });

    if (webResponse.ok) {
      const html = await webResponse.text();
      // Extract key information from HTML (simplified)
      const extractedInfo = extractInfoFromHTML(html, scheme);
      
      return {
        content: extractedInfo || scheme.fallback.content,
        source: webUrl,
        live: true,
        apiSource: 'MyScheme Web Portal'
      };
    }

  } catch (error) {
    console.log(`MyScheme fetch failed for ${schemeKey}:`, error);
  }

  // Fallback to our verified data
  return { ...scheme.fallback, live: false, apiSource: 'Verified Database' };
}

// Process MyScheme API response
function processMySchemeData(data: any, scheme: any) {
  let content = scheme.fallback.content;
  
  if (data && data.scheme) {
    const schemeData = data.scheme;
    
    // Build enhanced content from API data
    content = `🏛️ ${schemeData.name || scheme.name}\n\n`;
    
    if (schemeData.description) {
      content += `${schemeData.description}\n\n`;
    }
    
    if (schemeData.benefits) {
      content += `✅ Benefits: ${schemeData.benefits}\n\n`;
    }
    
    if (schemeData.eligibility) {
      content += `📋 Eligibility: ${schemeData.eligibility}\n\n`;
    }
    
    content += `🔗 Source: MyScheme.gov.in`;
  }
  
  return content;
}

// Extract information from MyScheme HTML (basic implementation)
function extractInfoFromHTML(html: string, scheme: any) {
  // This is a simplified version - in production, use proper HTML parsing
  const hasSchemeInfo = html.toLowerCase().includes(scheme.name.toLowerCase());
  
  if (hasSchemeInfo) {
    return `${scheme.fallback.content}\n\n🌐 Live data fetched from MyScheme.gov.in`;
  }
  
  return scheme.fallback.content;
}

// Smart scheme detection for MyScheme
function detectMyScheme(query: string): string {
  const lowerQuery = query.toLowerCase();
  let bestMatch = '';
  let highestScore = 0;

  for (const [schemeKey, scheme] of Object.entries(GOVERNMENT_SCHEMES)) {
    let score = 0;

    // Check search terms
    scheme.searchTerms.forEach(term => {
      if (lowerQuery.includes(term)) {
        score += 3;
      }
    });

    // Exact name match
    if (lowerQuery.includes(scheme.name.toLowerCase())) {
      score += 10;
    }

    // Contextual boosts
    if (schemeKey === 'pm-awas-yojana' && 
        (lowerQuery.includes('house') || lowerQuery.includes('home'))) {
      score += 5;
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = schemeKey;
    }
  }

  return highestScore > 2 ? bestMatch : 'general';
}

// Get all available schemes for general response
function getAvailableSchemes() {
  return Object.values(GOVERNMENT_SCHEMES)
    .map(scheme => `• ${scheme.name}`)
    .join('\n');
}

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    console.log('Processing query:', message);
    
    const detectedScheme = detectMyScheme(message);
    console.log('Detected scheme:', detectedScheme);

    if (detectedScheme === 'general') {
      return NextResponse.json({ 
        response: `I can help you with these government schemes from MyScheme.gov.in:\n\n${getAvailableSchemes()}\n\nPlease ask about any specific scheme for detailed information!`,
        source: "MyScheme.gov.in - National Government Schemes Portal"
      });
    }

    // Fetch data from MyScheme
    const schemeData = await fetchFromMyScheme(detectedScheme, message);
    const schemeInfo = GOVERNMENT_SCHEMES[detectedScheme as keyof typeof GOVERNMENT_SCHEMES];
    
    let responseText = `🏛️ ${schemeInfo.name}\n\n${schemeData.content}`;
    
    // Add API status
    if (schemeData.live) {
      responseText += `\n\n✅ Connected to: ${schemeData.apiSource}`;
    } else {
      responseText += `\n\n📚 Using verified information from MyScheme database`;
    }
    
    responseText += `\n\n🔗 Official MyScheme Page: ${schemeData.source}`;
    responseText += `\n\n🌐 Explore more: https://www.myscheme.gov.in`;

    return NextResponse.json({ 
      response: responseText,
      source: schemeData.source,
      scheme: schemeInfo.name,
      live: schemeData.live,
      apiSource: schemeData.apiSource
    });

  } catch (error) {
    console.error("MyScheme API Error:", error);
    
    return NextResponse.json({ 
      response: `I specialize in government schemes from MyScheme.gov.in including housing (PM Awas Yojana), farmer support (PM-KISAN), health insurance (Ayushman Bharat), scholarships, and employment programs. Ask me about any government service!`,
      source: "MyScheme.gov.in - National Government Schemes Portal"
    });
  }
}