import React, { useState, useEffect, useRef } from 'react';

import { ChatMessage, ChatSession } from './types';
import { generateLexiaResponseStream } from './services/geminiService';
import { Sidebar } from './components/Sidebar';
import { ChatMessage as ChatMessageComponent } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { LexiaLogo } from './components/LexiaLogo';

const SUGGESTIONS = [
  "Redactar un acuerdo de confidencialidad (NDA)",
  "Explicar cláusulas de 'Fuerza Mayor'",
  "Resumen de requisitos RGPD",
  "Elementos de la negligencia",
  "Redactar carta documento"
];

const getGreeting = () => {
  const hours = new Date().getHours();
  if (hours < 12) return 'Buenos días';
  if (hours < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

const App: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Create a default session ID if none exists
  const ensureSession = () => {
    if (!currentSessionId) {
      const newId = Date.now().toString();
      const newSession: ChatSession = {
        id: newId,
        title: 'Nueva Consulta',
        messages: [],
        updatedAt: Date.now(),
      };
      setSessions(prev => [newSession, ...prev]);
      setCurrentSessionId(newId);
      return newSession;
    }
    return sessions.find(s => s.id === currentSessionId)!;
  };

  const getCurrentMessages = () => {
    return sessions.find(s => s.id === currentSessionId)?.messages || [];
  };

  const updateCurrentSessionMessages = (newMessages: ChatMessage[]) => {
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        // Update title based on first user message if it's "Nueva Consulta"
        let title = s.title;
        if (s.title === 'Nueva Consulta' && newMessages.length > 0) {
          const firstUserMsg = newMessages.find(m => m.role === 'user');
          if (firstUserMsg) {
            title = firstUserMsg.text.slice(0, 30) + (firstUserMsg.text.length > 30 ? '...' : '');
          }
        }
        return { ...s, messages: newMessages, title, updatedAt: Date.now() };
      }
      return s;
    }));
  };

  const handleSend = async (text: string, useSearch: boolean) => {
    const session = ensureSession(); // Ensure we have a valid session

    // Optimistic user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now(),
    };

    const updatedMessages = [...(session.messages || []), userMsg];

    // Add placeholder AI message
    const aiMsgId = (Date.now() + 1).toString();
    const aiPlaceholder: ChatMessage = {
      id: aiMsgId,
      role: 'model',
      text: '',
      isStreaming: true,
      timestamp: Date.now() + 1,
    };

    updateCurrentSessionMessages([...updatedMessages, aiPlaceholder]);
    setIsLoading(true);

    let accumulatedText = '';

    await generateLexiaResponseStream(
      updatedMessages,
      text,
      undefined, // use default model
      useSearch,
      (chunkText, sources) => {
        accumulatedText += chunkText;

        setSessions(prev => prev.map(s => {
          if (s.id === currentSessionId) {
            const msgs = [...s.messages];
            // Find the placeholder we added (it's the last one)
            // Note: In strict React 18, we might need a more robust ID check, 
            // but since we just added it, it's safe for this demo.
            const lastMsgIndex = msgs.length - 1;
            if (lastMsgIndex >= 0) {
              msgs[lastMsgIndex] = {
                ...msgs[lastMsgIndex],
                text: accumulatedText,
                sources: sources || msgs[lastMsgIndex].sources // Keep existing sources or update if new ones arrive
              };
            }
            return { ...s, messages: msgs };
          }
          return s;
        }));
      }
    );

    // Finalize loading state
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        const msgs = [...s.messages];
        const lastMsgIndex = msgs.length - 1;
        if (lastMsgIndex >= 0) {
          msgs[lastMsgIndex] = { ...msgs[lastMsgIndex], isStreaming: false };
        }
        return { ...s, messages: msgs };
      }
      return s;
    }));
    setIsLoading(false);
  };

  const messages = getCurrentMessages();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, messages[messages.length - 1]?.text]);

  const isLanding = messages.length === 0;

  return (
    <div className="flex h-screen bg-[#050505] text-gray-100 overflow-hidden font-sans">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewChat={() => setCurrentSessionId(null)}
      />

      <div className="flex-1 flex flex-col h-full relative transition-all duration-300">


        {/* Mobile Header */}
        <div className="md:hidden flex items-center h-14 px-4 bg-[#080808] relative">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-gray-400 hover:text-white transition-colors p-1 flex items-center justify-center"
            aria-label="Menu"
          >
            {/* Custom 'Two and a half lines' icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="8" x2="21" y2="8" />
              <line x1="3" y1="16" x2="15" y2="16" />
            </svg>
          </button>
          <span className="font-serif text-lg text-lexia-gold ml-4 pt-1 leading-none">Lexia</span>
        </div>

        {/* Main Chat Area */}
        <div className={`flex-1 custom-scrollbar scroll-smooth ${messages.length === 0 ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-start pt-[25vh] md:pt-[22vh] p-8 text-center animate-fade-in">
              <div className="flex items-center justify-center mb-6 md:hidden">
                <LexiaLogo className="w-24 h-24 text-[#333333] opacity-80" />
              </div>
            </div>
          ) : (
            <div className="pb-32">
              {/* Disclaimer Header for Chat */}
              <div className="w-full bg-[#111] border-b border-lexia-border/50 py-2 px-4 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Simulación de IA Privilegiada y Confidencial</p>
              </div>

              {messages.map((msg) => (
                <ChatMessageComponent key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area (Sticky) */}
        <div className={`absolute left-0 right-0 z-10 pt-4 pb-6 transition-all duration-500 ease-in-out
          ${isLanding
            ? 'bottom-0 md:top-1/2 md:-translate-y-1/2 md:bottom-auto'
            : 'bottom-0'
          }
          ${isLanding
            ? 'bg-gradient-to-t from-[#050505] via-[#050505] to-transparent md:bg-none'
            : 'bg-gradient-to-t from-[#050505] via-[#050505] to-transparent'
          }
        `}>

          {/* Desktop Greeting - Only on Landing */}
          {isLanding && (
            <div className="hidden md:block text-center mb-8 animate-fade-in">
              <h2 className="text-3xl font-serif font-medium text-gray-200 tracking-tight">
                {getGreeting()}, <span className="text-lexia-gold">Marcos</span>
              </h2>
            </div>
          )}

          {/* Horizontal Suggestions - Mobile Only (md:hidden), No scrollbar, Chat-box style radius (rounded-xl) */}
          {/* ONLY show when messages.length === 0 (New Chat) */}
          {messages.length === 0 && (
            <div className="max-w-3xl mx-auto w-full px-4 mb-3 animate-fade-in md:hidden">
              <div className="flex flex-row items-center justify-start gap-3 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {SUGGESTIONS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt, true)}
                    className="flex-shrink-0 px-4 py-3 bg-[#18181b] hover:bg-[#27272a] border border-lexia-border/60 hover:border-lexia-gold/30 rounded-xl text-xs text-gray-300 hover:text-lexia-text transition-all duration-300 whitespace-nowrap shadow-sm"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          <ChatInput onSend={handleSend} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
};

export default App;
// Trigger Vercel deployment