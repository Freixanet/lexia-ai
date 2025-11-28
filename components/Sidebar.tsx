import React from 'react';
import { Plus, X, FileText, ChevronRight, PanelLeftClose } from 'lucide-react';
import { ChatSession } from '../types';
import { LexiaLogo } from './LexiaLogo';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  toggleSidebar,
  isCollapsed,
  toggleCollapse,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={toggleSidebar}
      />

      {/* Sidebar Panel */}
      <div 
        className={`fixed md:static inset-y-0 left-0 z-50 bg-lexia-bg flex flex-col transition-all duration-300 ease-in-out overflow-hidden
          ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'md:w-0 border-none' : 'md:w-[280px] w-[280px] border-r border-lexia-border'}
        `}
      >
        {/* Header */}
        <div className="flex flex-row items-center justify-between p-6 pb-2 min-w-[280px]">
            {/* Logo Wrapper */}
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                  <LexiaLogo className="w-8 h-8 text-lexia-gold" />
              </div>
              <span className="font-serif text-xl tracking-wide font-medium text-gray-100">
                Lexia
              </span>
            </div>
            
            {/* Mobile Close Button */}
            <button onClick={toggleSidebar} className="md:hidden text-gray-500 hover:text-white transition-colors">
              <X size={20} />
            </button>

            {/* Desktop Collapse Button (Only acts as Close here) */}
            <button 
              onClick={toggleCollapse} 
              className="hidden md:flex text-lexia-muted hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/5"
              title="Cerrar barra lateral"
            >
              <PanelLeftClose size={18} />
            </button>
        </div>

        {/* New Chat Button */}
        <div className="px-5 py-6 min-w-[280px]">
            <button
              onClick={() => {
                onNewChat();
                if (window.innerWidth < 768) toggleSidebar();
              }}
              className="group w-full flex items-center justify-center gap-2 bg-lexia-text text-lexia-bg hover:bg-white text-sm font-medium px-4 py-3 rounded-md shadow-lg shadow-white/5 transition-all duration-200"
              title="Nueva Consulta"
            >
              <Plus size={18} className="flex-shrink-0" />
              <span>Nueva Consulta</span>
            </button>
        </div>

        {/* Navigation / History */}
        <div className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar overflow-x-hidden min-w-[280px]">
             <div className="px-3 mb-2 flex items-center justify-between animate-fade-in">
                <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-widest whitespace-nowrap">Consultas Recientes</span>
             </div>
             
             <div className="space-y-1">
             {sessions.length === 0 ? (
                 <div className="px-3 py-4 text-sm text-gray-600 italic whitespace-nowrap">
                   El historial aparecerá aquí.
                 </div>
             ) : (
               sessions.map((session) => (
                 <button
                   key={session.id}
                   onClick={() => {
                     onSelectSession(session.id);
                     if (window.innerWidth < 768) toggleSidebar();
                   }}
                   className={`group w-full flex items-center gap-3 px-3 py-3 text-sm rounded-md transition-all duration-200 border border-transparent
                     ${currentSessionId === session.id
                       ? 'bg-lexia-panel text-gray-100 border-lexia-border shadow-sm'
                       : 'text-gray-400 hover:bg-lexia-panel/50 hover:text-gray-200'}
                   `}
                   title={session.title}
                 >
                   <FileText size={16} className={`flex-shrink-0 ${currentSessionId === session.id ? 'text-lexia-gold' : 'opacity-40 group-hover:opacity-70'}`} />
                   
                   <span className="truncate text-left flex-1 block">
                     {session.title}
                   </span>
                   
                   {currentSessionId === session.id && (
                     <ChevronRight size={12} className="text-lexia-gold opacity-50 flex-shrink-0" />
                   )}
                 </button>
               ))
             )}
             </div>
        </div>

        {/* Footer */}
        <div className="border-t border-lexia-border/40 bg-lexia-panel/30 p-5 min-w-[280px]">
            <a href="#" className="flex items-center gap-3 text-gray-400 hover:text-lexia-gold transition-colors group mb-3" title="Biblioteca de Cláusulas">
               <LexiaLogo className="w-[18px] h-[18px] text-gray-400 group-hover:text-lexia-gold group-hover:scale-110 transition-all flex-shrink-0" />
               <span className="text-xs font-medium whitespace-nowrap">
                 Biblioteca
               </span>
            </a>
            
            <div className="flex items-center justify-between pt-3 border-t border-lexia-border/30 w-full">
                 <span className="text-[10px] text-gray-600 font-mono whitespace-nowrap">Lexia v2.0 • PRO</span>
                 <div className="w-2 h-2 rounded-full bg-green-500/20 border border-green-500/50"></div>
            </div>
        </div>
      </div>
    </>
  );
};