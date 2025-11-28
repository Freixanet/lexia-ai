import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage as ChatMessageType, Source } from '../types';
import { LexiaLogo } from './LexiaLogo';
import { User, Copy, Check, BookOpen } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
}

const SourceCitation: React.FC<{ sources: Source[] }> = ({ sources }) => {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="mt-6 pt-4 border-t border-lexia-border/60">
      <div className="flex items-center gap-2 mb-3 text-lexia-gold/80">
        <BookOpen size={14} />
        <h4 className="text-xs font-semibold uppercase tracking-widest">Fuentes Citadas</h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sources.map((source, idx) => (
          <a
            key={idx}
            href={source.uri}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between bg-lexia-border/30 hover:bg-lexia-border/50 border border-transparent hover:border-lexia-gold/20 px-3 py-2 rounded-md transition-all duration-200"
          >
            <span className="text-xs text-gray-300 truncate pr-2 group-hover:text-lexia-gold transition-colors">
              {source.title || new URL(source.uri).hostname}
            </span>
            <span className="text-[10px] text-gray-600 group-hover:text-lexia-gold/70">↗</span>
          </a>
        ))}
      </div>
    </div>
  );
};

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [displayedText, setDisplayedText] = useState(
    message.isStreaming ? '' : message.text
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Typewriter effect logic
  useEffect(() => {
    // If it's a user message or streaming has finished, ensure we show full text instantly.
    // However, if we were just streaming, this snap might be visible if the lag was large,
    // but usually it's desirable to ensure consistency at the end.
    if (isUser || !message.isStreaming) {
      setDisplayedText(message.text);
      return;
    }

    // If streaming and we have content to reveal
    if (displayedText.length < message.text.length) {
      const queueLength = message.text.length - displayedText.length;

      // Adaptive speed: faster if we are falling behind
      let charStep = 1;
      let delay = 15; // Base speed in ms

      if (queueLength > 50) {
        charStep = 5;
        delay = 5;
      } else if (queueLength > 20) {
        charStep = 2;
        delay = 10;
      }

      const timer = setTimeout(() => {
        setDisplayedText(message.text.slice(0, displayedText.length + charStep));
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [message.text, message.isStreaming, displayedText, isUser]);

  return (
    <div className={`group w-full py-8 px-4 border-b border-lexia-border/20 ${isUser ? 'bg-transparent' : 'bg-[#121214]/30'}`}>
      <div className="max-w-3xl mx-auto flex gap-6">
        <div className="flex-shrink-0 flex flex-col items-center pt-1">
          {/* Logo/Avatar without external square */}
          <div className="w-8 h-8 flex items-center justify-center">
            {isUser ? (
              <User size={20} className="text-gray-500" />
            ) : (
              <LexiaLogo className="w-6 h-6 text-lexia-gold" />
            )}
          </div>
        </div>

        <div className="flex-grow min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-medium ${isUser ? 'text-gray-400' : 'text-lexia-gold'}`}>
              {isUser ? 'Tu Consulta' : 'Lexia'}
            </span>
            {!isUser && (
              <button
                onClick={handleCopy}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-lexia-muted hover:text-white p-1.5 rounded hover:bg-white/5"
                aria-label="Copiar mensaje"
                title="Copiar texto legal"
              >
                {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
              </button>
            )}
          </div>

          <div className={`prose-legal text-base ${isUser ? 'text-gray-200' : 'text-gray-300 font-serif'}`}>
            {isUser ? (
              <div className="whitespace-pre-wrap font-sans">{message.text}</div>
            ) : (
              <div className="min-h-[20px]">
                <ReactMarkdown>{displayedText}</ReactMarkdown>
                {message.isStreaming && (
                  <span className="inline-block w-1.5 h-4 ml-0.5 align-middle bg-lexia-gold animate-pulse rounded-[1px]" />
                )}
              </div>
            )}
          </div>

          {!isUser && message.sources && <SourceCitation sources={message.sources} />}
        </div>
      </div>
    </div>
  );
};