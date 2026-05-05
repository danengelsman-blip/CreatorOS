import React from 'react';
import { cn } from '../lib/utils';

interface BrandIconProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export default function BrandIcon({ className, size = 24, glow = false }: BrandIconProps) {
  return (
    <div className="relative flex items-center justify-center">
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 40 40" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={cn("relative z-10", className)}
      >
        <defs>
          <filter id="glass-refraction" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
            <feOffset dx="1" dy="1" result="offsetBlur" />
            <feComposite in="offsetBlur" in2="SourceAlpha" operator="out" result="inverse" />
            <feFlood floodColor="white" floodOpacity="0.4" result="color" />
            <feComposite in="color" in2="inverse" operator="in" result="shadow" />
            <feComposite in="shadow" in2="SourceAlpha" operator="in" />
          </filter>
          <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D97706" />
            <stop offset="50%" stopColor="#FBDB8B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <radialGradient id="emerald-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Emerald Core Glow */}
        {glow && (
          <circle cx="20" cy="20" r="16" fill="url(#emerald-glow)" className="animate-pulse" />
        )}

        {/* Refractive Glass Base (Architecture/Palette Shape) */}
        <path 
          d="M20 4L32 10V30L20 36L8 30V10L20 4Z" 
          fill="rgba(255, 255, 255, 0.05)" 
          stroke="rgba(255, 255, 255, 0.2)" 
          strokeWidth="1.5"
          filter="url(#glass-refraction)"
        />

        {/* Gold Inlay (Stylized Compass/Architectural Detail) */}
        <path 
          d="M20 12V28M12 20H28M20 12L25 10L20 4L15 10L20 12ZM20 28L15 30L20 36L25 30L20 28Z" 
          stroke="url(#gold-gradient)" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        
        {/* Detail Sparks */}
        <circle cx="20" cy="20" r="1" fill="#FFFFFF" />
      </svg>
    </div>
  );
}
