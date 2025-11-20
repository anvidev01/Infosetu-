'use client';

import { useState, useRef, useEffect } from 'react';
import { createWorker } from 'tesseract.js';

type Message = {
  text: string;
  isUser: boolean;
  timestamp: Date;
};

type Language = 'en' | 'hi';
type Locale = 'en-IN' | 'hi-IN';

// --- Language translations for static text ---
const translations = {
  en: {
    welcome: "Namaste! I'm InfoSetu, your AI-powered citizen service assistant. I serve as your intelligent bridge to government services, helping you with schemes, forms, eligibility criteria, and more - all in your preferred language. You can also upload a document to ask questions about it. How may I assist you today?",
    title: "InfoSetu - AI Citizen Assistant",
    subtitle: "Your intelligent bridge to government services",
    quickHelp: "Quick Help Topics",
    placeholder: "Ask about government schemes, forms, eligibility...",
    listening: "Listening...",
    processing: "Processing document...",
    error: "Sorry, I'm having trouble connecting right now. Please check your internet connection and try again.",
    voiceOn: "🔊 Voice On",
    voiceOff: "🔇 Voice Off",
    uploadDoc: "Upload Document",
    send: "Send",
    typing: "InfoSetu is typing...",
    stopVoice: "⏹️ Stop Voice", // 🆕 NEW TRANSLATION
  },
  hi: {
    welcome: "नमस्ते! मैं इन्फोसेतु, आपका एआई-संचालित नागरिक सेवा सहायक हूं। मैं सरकारी सेवाओं के लिए आपके बुद्धिमान सेतु के रूप में कार्य करता हूं, जो आपको योजनाओं, प्रपत्रों, पात्रता मानदंडों और बहुत कुछ के साथ आपकी पसंदीदा भाषा में मदद करता है। आप इसके बारे में प्रश्न पूछने के लिए कोई दस्तावेज़ भी अपलोड कर सकते हैं। मैं आज आपकी किस प्रकार सहायता कर सकता हूँ?",
    title: "इन्फोसेतु - एआई नागरिक सहायक",
    subtitle: "सरकारी सेवाओं के लिए आपका बुद्धिमान सेतु",
    quickHelp: "त्वरित सहायता विषय",
    placeholder: "सरकारी योजनाओं, प्रपत्रों, पात्रता के बारे में पूछें...",
    listening: "सुन रहा हूँ...",
    processing: "दस्तावेज़ संसाधित हो रहा है...",
    error: "क्षमा करें, मुझे अभी कनेक्ट करने में समस्या हो रही है। कृपया अपना इंटरनेट कनेक्शन जांचें और पुनः प्रयास करें।",
    voiceOn: "🔊 आवाज़ चालू",
    voiceOff: "🔇 आवाज़ बंद",
    uploadDoc: "दस्तावेज़ अपलोड",
    send: "भेजें",
    typing: "इन्फोसेतु टाइप कर रहा है...",
    stopVoice: "⏹️ आवाज़ रोकें", // 🆕 NEW TRANSLATION
  }
};

export default function ChatInterface() {
  const [language, setLanguage] = useState<Language>('en');
  const [locale, setLocale] = useState<Locale>('en-IN');
  const [txt, setTxt] = useState(translations.en);

  const [messages, setMessages] = useState<Message[]>([
    {
      text: translations.en.welcome,
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // 🆕 TRACK SPEECH STATE
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // --- Refs to hold browser-only APIs ---
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);

  // --- Initialize browser APIs on client-side only ---
  useEffect(() => {
    setIsClient(true);
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.lang = locale;
      recognitionInstance.interimResults = false;
      recognitionInstance.maxAlternatives = 1;
      recognitionRef.current = recognitionInstance;
    }

    synthRef.current = (window as any).speechSynthesis;
  }, []);

  // Update recognition language when locale changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = locale;
    }
  }, [locale]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 🆕 STOP VOICE FUNCTION
  const stopVoice = () => {
    const synth = synthRef.current;
    if (synth) {
      synth.cancel();
      setIsSpeaking(false);
    }
  };

  // 🆕 ENHANCED HUMAN-LIKE VOICE FUNCTION
  const speakMessage = (text: string) => {
    const synth = synthRef.current;
    if (!isSpeechEnabled || !synth) return;
    
    // Cancel any current speech
    synth.cancel();
    
    // 🆕 MINIMAL CLEANING - ONLY REMOVE AI CREDITS
    const cleanText = text.replace(/\*🤖 Powered by.*\*/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // 🆕 NATURAL SETTINGS (NOT ROBOTIC)
    utterance.rate = 1.0;     // Normal speed (was 0.85 - too slow)
    utterance.pitch = 1.0;    // Normal pitch (was 1.1 - too high)
    utterance.volume = 1.0;   // Full volume
    utterance.lang = locale;
    
    // 🆕 TRACK SPEECH STATE
    utterance.onstart = () => {
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    synth.speak(utterance);
  };
  
  useEffect(() => {
    if (isListening && synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, [isListening]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }

    const userMessage: Message = {
      text: messageText,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: messageText, 
          language: language,
          chatHistory: messages.map(msg => ({
            role: msg.isUser ? 'user' : 'assistant',
            content: msg.text
          }))
        }),
      });

      const data = await response.json();
      
      const aiMessage: Message = {
        text: data.response,
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
      
      // 🆕 DELAY SPEECH FOR MORE NATURAL FEEL
      setTimeout(() => {
        speakMessage(data.response);
      }, 500);

    } catch (error) {
      const errorMessage: Message = {
        text: txt.error,
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setTimeout(() => {
        speakMessage(errorMessage.text);
      }, 500);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert("Please upload an image file (PNG, JPG, JPEG, etc.).");
        return;
      }

      setIsLoading(true);
      setIsProcessingImage(true);

      try {
        console.log('🔄 Starting OCR processing for:', file.name);
        
        // 🆕 SIMPLE AND RELIABLE WORKER SETUP
        const worker = await createWorker('eng');
        
        console.log('📄 Processing image with Tesseract...');
        
        const { data: { text } } = await worker.recognize(file);
        
        console.log('✅ OCR completed. Text length:', text.length);
        
        await worker.terminate();

        const extractedText = text.trim();
        
        let ocrMessage: Message;
        
        if (extractedText && extractedText.length > 10) {
          ocrMessage = {
            text: `📄 **Document Uploaded Successfully!**\n\n**Extracted Text:**\n"${extractedText.substring(0, 200)}${extractedText.length > 200 ? '...' : ''}"\n\nYou can now ask questions about this document!`,
            isUser: false,
            timestamp: new Date()
          };
          
          // Auto-suggest a question
          setInput(`What is this document about?`);
        } else {
          ocrMessage = {
            text: `❌ **No readable text found**\n\nI couldn't extract clear text from this image. Please try:\n• A clearer, higher quality image\n• Image with larger, clearer text\n• Different image format (PNG/JPG)`,
            isUser: false,
            timestamp: new Date()
          };
        }
        
        setMessages(prev => [...prev, ocrMessage]);

      } catch (error: any) {
        console.error('❌ OCR processing failed:', error);
        
        const errorMessage: Message = {
          text: `❌ **Document Processing Failed**\n\nError: ${error.message || 'Unknown error occurred'}\n\nPlease try a different image or check the console for details.`,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, errorMessage]);
        
      } finally {
        setIsLoading(false);
        setIsProcessingImage(false);

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    }
  };

  const handleListen = () => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      alert("Sorry, your browser does not support voice recognition.");
      return;
    }
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
      return;
    }

    recognition.start();
    setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      setTimeout(() => {
        setInput(transcript);
        sendMessage(transcript);
      }, 100);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  const handleQuickHelp = (service: string) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
    const query = language === 'hi' 
      ? `मुझे ${service} के बारे में बताएं` 
      : `Tell me about ${service}`;
    sendMessage(query);
    setInput('');
  };

  const formatTime = (date: Date) => {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
};

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    setTxt(translations[lang]);
    const newLocale = lang === 'en' ? 'en-IN' : 'hi-IN';
    setLocale(newLocale);
    
    setMessages(prevMessages => {
      const firstMessage = {
        ...prevMessages[0],
        text: translations[lang].welcome
      };
      return [firstMessage, ...prevMessages.slice(1)];
    });
  };

  // Quick help topics with colorful gradients and icons
  const quickHelpTopics = [
    { 
      name: "PM-KISAN Scheme", 
      icon: "👨‍🌾", 
      en: "PM-KISAN Scheme", 
      hi: "पीएम-किसान योजना",
      gradient: "from-green-500 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50"
    },
    { 
      name: "Aadhaar Services", 
      icon: "🆔", 
      en: "Aadhaar Services", 
      hi: "आधार सेवाएं",
      gradient: "from-blue-500 to-cyan-600",
      bgGradient: "from-blue-50 to-cyan-50"
    },
    { 
      name: "Digital Ration Card", 
      icon: "📱", 
      en: "Digital Ration Card", 
      hi: "डिजिटल राशन कार्ड",
      gradient: "from-purple-500 to-violet-600",
      bgGradient: "from-purple-50 to-violet-50"
    },
    { 
      name: "Pension Schemes", 
      icon: "👵", 
      en: "Pension Schemes", 
      hi: "पेंशन योजनाएं",
      gradient: "from-orange-500 to-amber-600",
      bgGradient: "from-orange-50 to-amber-50"
    },
    { 
      name: "Employment Programs", 
      icon: "💼", 
      en: "Employment Programs", 
      hi: "रोजगार कार्यक्रम",
      gradient: "from-indigo-500 to-blue-600",
      bgGradient: "from-indigo-50 to-blue-50"
    },
    { 
      name: "Health Insurance", 
      icon: "🏥", 
      en: "Health Insurance", 
      hi: "स्वास्थ्य बीमा",
      gradient: "from-red-500 to-pink-600",
      bgGradient: "from-red-50 to-pink-50"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full blur-3xl opacity-10 animate-pulse delay-500"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 via-purple-800 to-slate-800 rounded-t-2xl shadow-2xl p-8 text-center border-b border-purple-600/30 backdrop-blur-sm bg-white/5">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg rotate-6 transform group-hover:rotate-12 transition-transform duration-300">
                <span className="text-2xl">🇮🇳</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                {txt.title}
              </h1>
              <p className="text-purple-200 text-lg font-light tracking-wide">
                {txt.subtitle}
              </p>
            </div>
          </div>
        </div>

        {/* Language and Controls Bar */}
        <div className="bg-slate-800/80 backdrop-blur-md px-6 py-4 flex flex-col sm:flex-row justify-between items-center border-b border-slate-700/50 shadow-lg">
          <div className="flex space-x-3 mb-3 sm:mb-0">
            <button 
              onClick={() => changeLanguage('en')}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                language === 'en' 
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25' 
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50'
              }`}
            >
              🇺🇸 English
            </button>
            <button 
              onClick={() => changeLanguage('hi')}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                language === 'hi' 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25' 
                  : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50'
              }`}
            >
              🇮🇳 हिंदी
            </button>
          </div>
          
          <div className="flex space-x-3">
            {/* 🆕 STOP VOICE BUTTON - Only show when speaking */}
            {isSpeaking && (
              <button 
                onClick={stopVoice}
                className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/25 hover:from-red-600 hover:to-pink-600 animate-pulse"
                title="Stop current speech"
              >
                {txt.stopVoice}
              </button>
            )}
            
            <button 
              onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                isSpeechEnabled 
                  ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg shadow-emerald-500/25' 
                  : 'bg-slate-700/50 text-slate-300 border border-slate-600/50'
              }`}
            >
              {isSpeechEnabled ? txt.voiceOn : txt.voiceOff}
            </button>
          </div>
        </div>

        {/* Main Chat Container */}
        <div className="bg-slate-800/60 backdrop-blur-md rounded-b-2xl shadow-2xl overflow-hidden border border-slate-700/50">
          {/* Messages Area */}
          <div className="h-96 overflow-y-auto mb-6 p-6 bg-gradient-to-b from-slate-900/50 to-slate-800/30">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-6`}
              >
                <div
                  className={`max-w-xs lg:max-w-md rounded-2xl p-5 transition-all duration-300 transform hover:scale-105 ${
                    message.isUser
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-500 text-white rounded-br-none shadow-lg shadow-cyan-500/25'
                      : 'bg-gradient-to-br from-slate-700 to-slate-600 text-slate-100 rounded-bl-none shadow-lg border border-slate-600/50'
                  }`}
                >
                  {!message.isUser && (
                    <div className="flex items-center mb-3">
                      <div className="w-7 h-7 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mr-3 shadow-md">
                        <span className="text-xs text-white font-bold">AI</span>
                      </div>
                      <span className="text-sm font-semibold text-purple-200">InfoSetu</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
                    {message.text}
                  </p>
                  <p className={`text-xs mt-3 font-medium ${message.isUser ? 'text-cyan-100' : 'text-slate-400'}`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Loading Indicator */}
            {(isLoading || isProcessingImage) && (
              <div className="flex justify-start mb-6">
                <div className="bg-gradient-to-br from-slate-700 to-slate-600 rounded-2xl rounded-bl-none p-5 max-w-xs shadow-lg border border-slate-600/50">
                  <div className="flex items-center mb-3">
                    <div className="w-7 h-7 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center mr-3 shadow-md">
                      <span className="text-xs text-white font-bold">AI</span>
                    </div>
                    <span className="text-sm font-semibold text-purple-200">{txt.typing}</span>
                  </div>
                  {isProcessingImage ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <p className="text-sm text-purple-300">{txt.processing}</p>
                    </div>
                  ) : (
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Help Section */}
          <div className="mb-8 px-8">
            <h3 className="text-xl font-bold text-slate-200 mb-6 flex items-center justify-center">
              <span className="w-3 h-3 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mr-3 animate-pulse"></span>
              {txt.quickHelp}
              <span className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full ml-3 animate-pulse delay-300"></span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {quickHelpTopics.map((topic, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickHelp(topic.name)}
                  disabled={isLoading || isProcessingImage}
                  className={`bg-gradient-to-br ${topic.bgGradient} border border-slate-600/30 rounded-2xl p-4 text-center hover:scale-105 hover:shadow-2xl transition-all duration-300 group disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                >
                  <div className={`w-12 h-12 mx-auto mb-3 rounded-2xl bg-gradient-to-r ${topic.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300`}>
                    <span className="text-xl">{topic.icon}</span>
                  </div>
                  <span className={`text-sm font-semibold bg-gradient-to-r ${topic.gradient} bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300`}>
                    {language === 'hi' ? topic.hi : topic.en}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-md px-6 py-6">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage(input)}
                  placeholder={isListening ? "🎤 " + txt.listening : txt.placeholder}
                  className="w-full bg-slate-700/50 border border-slate-600/50 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300 text-slate-100 placeholder-slate-400 shadow-inner backdrop-blur-sm disabled:bg-slate-800/30"
                  disabled={isLoading || isProcessingImage}
                />
                {isListening && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-4 bg-red-400 rounded-full animate-pulse shadow-md shadow-red-400/50"></div>
                      <div className="w-1.5 h-6 bg-red-400 rounded-full animate-pulse shadow-md shadow-red-400/50" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-1.5 h-4 bg-red-400 rounded-full animate-pulse shadow-md shadow-red-400/50" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* 🆕 UPDATED File Upload Button */}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".png,.jpg,.jpeg,.gif,.webp" 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading || isProcessingImage}
                className={`px-5 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:scale-105 flex items-center justify-center min-w-[60px] ${
                  isProcessingImage 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white animate-pulse shadow-purple-500/25' 
                    : 'bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:from-emerald-600 hover:to-green-600 shadow-emerald-500/25'
                } disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed disabled:transform-none`}
                title={isProcessingImage ? "Processing document..." : txt.uploadDoc}
              >
                {isProcessingImage ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="text-lg">📄</span>
                )}
              </button>
              
              {/* Voice Input Button */}
              {isClient && recognitionRef.current && (
                <button 
                  onClick={handleListen}
                  disabled={isLoading || isProcessingImage}
                  className={`px-5 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:scale-105 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center min-w-[60px] ${
                    isListening
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse shadow-red-500/25'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-amber-500/25'
                  }`}
                  title="Voice Input"
                >
                  <span className="text-lg">🎤</span>
                </button>
              )}
              
              {/* Send Button */}
              <button 
                onClick={() => sendMessage(input)}
                disabled={isLoading || isProcessingImage || !input.trim()}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-8 py-4 rounded-2xl hover:from-cyan-600 hover:to-blue-600 hover:scale-105 transition-all duration-300 shadow-lg shadow-cyan-500/25 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed disabled:transform-none font-semibold flex items-center justify-center min-w-[100px]"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="flex items-center">
                    {txt.send} 
                    <span className="ml-2 text-lg">🚀</span>
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-slate-400 text-sm font-light">
          <div className="flex items-center justify-center space-x-6">
            <span className="flex items-center">
              <span className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mr-2 animate-pulse"></span>
              Powered by AI
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full mr-2 animate-pulse delay-300"></span>
              Secure & Private
            </span>
            <span className="flex items-center">
              <span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-2 animate-pulse delay-500"></span>
              Always Free
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}