import React, { useState, useRef, useEffect } from 'react';
import { SendHorizontal, Globe, Loader2, Paperclip } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string, useSearch: boolean) => void;
  isLoading: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [input, setInput] = useState('');
  const [useSearch, setUseSearch] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSend(input, useSearch);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  return (
    <div className="max-w-3xl mx-auto w-full px-4">
      <div className="relative bg-[#18181b] rounded-xl border border-lexia-border shadow-2xl shadow-black/50 transition-colors focus-within:border-lexia-gold/40 focus-within:ring-1 focus-within:ring-lexia-gold/40 group">
        
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe el caso o pregunta legal..."
          rows={1}
          className="w-full bg-transparent text-gray-200 placeholder-gray-500 text-[15px] px-4 pt-4 pb-12 focus:outline-none resize-none overflow-hidden max-h-[200px]"
          style={{ minHeight: '64px' }}
        />

        {/* Bottom Actions Toolbar */}
        <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center z-20">
          <div className="flex items-center gap-1">
             <button 
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setUseSearch(!useSearch)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                useSearch 
                  ? 'bg-lexia-gold/10 text-lexia-gold border-lexia-gold/20' 
                  : 'text-gray-500 hover:text-gray-300 border-transparent hover:bg-white/5'
              }`}
             >
               <Globe size={14} />
               {useSearch ? 'Búsqueda Activa' : 'Búsqueda'}
             </button>
             
             <button 
               type="button"
               onMouseDown={(e) => e.preventDefault()}
               className="p-2 text-gray-500 hover:text-gray-300 rounded-lg hover:bg-white/5 transition-colors" 
               title="Adjuntar documento (Simulado)"
             >
                <Paperclip size={16} />
             </button>
          </div>
          
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            disabled={!input.trim() || isLoading}
            className={`p-2 rounded-lg transition-all duration-200 ${
              input.trim() && !isLoading
                ? 'bg-lexia-gold text-black hover:bg-lexia-goldDim shadow-lg shadow-lexia-gold/20'
                : 'bg-[#27272a] text-gray-600 cursor-not-allowed'
            }`}
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : <SendHorizontal size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};