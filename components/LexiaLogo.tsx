import React from 'react';

export const LexiaLogo: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    {/* Right Pan */}
    <path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    {/* Left Pan */}
    <path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
    {/* Base */}
    <path d="M7 21h10" />
    {/* Central Pillar */}
    <path d="M12 3v18" />
    {/* Top Crossbar */}
    <path d="M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
  </svg>
);