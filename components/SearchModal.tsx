import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, ChevronRight } from 'lucide-react';
import { ChatSession } from '../types';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    sessions: ChatSession[];
    onSelectSession: (id: string) => void;
    isCollapsed: boolean;
}

export const SearchModal: React.FC<SearchModalProps> = ({
    isOpen,
    onClose,
    sessions,
    onSelectSession,
    isCollapsed
}) => {
    const [query, setQuery] = useState('');
    const [filteredSessions, setFilteredSessions] = useState<ChatSession[]>(sessions);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
            setQuery('');
            setFilteredSessions(sessions);
        }
    }, [isOpen, sessions]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (query.trim() === '') {
            setFilteredSessions(sessions);
        } else {
            const lowerQuery = query.toLowerCase();
            setFilteredSessions(sessions.filter(session =>
                session.title.toLowerCase().includes(lowerQuery)
            ));
        }
    }, [query, sessions]);

    if (!isOpen) return null;

    return (
        <div className={`fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4 transition-all duration-300 ${isCollapsed ? 'md:pl-[80px]' : 'md:pl-[280px]'}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-[#111] border border-lexia-border/50 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[60vh] animate-fade-in">

                {/* Header / Input */}
                <div className="flex items-center border-b border-lexia-border/30 p-4 gap-3">
                    <Search size={20} className="text-lexia-gold" />
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Buscar en consultas anteriores..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-500 text-sm font-medium"
                    />
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {filteredSessions.length === 0 ? (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            No se encontraron resultados.
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredSessions.map((session) => (
                                <button
                                    key={session.id}
                                    onClick={() => {
                                        onSelectSession(session.id);
                                        onClose();
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg hover:bg-white/5 text-gray-300 hover:text-white transition-all group text-left"
                                >
                                    <FileText size={16} className="text-gray-500 group-hover:text-lexia-gold transition-colors flex-shrink-0" />
                                    <span className="flex-1 truncate">{session.title}</span>
                                    <ChevronRight size={14} className="text-gray-600 opacity-0 group-hover:opacity-100 transition-all" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer Hint */}
                <div className="bg-[#0a0a0a] border-t border-lexia-border/30 px-4 py-2 text-[10px] text-gray-500 flex justify-between items-center">
                    <span>{filteredSessions.length} resultados</span>
                    <span className="hidden md:inline">ESC para cerrar</span>
                </div>
            </div>
        </div>
    );
};
