import React from 'react';
import { cn } from '../lib/utils';

interface IconProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

const PremiumIconWrapper = ({ children, size, glow, className }: { children: React.ReactNode, size: number, glow?: boolean, className?: string }) => (
  <div className={cn("relative flex items-center justify-center", className)}>
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="glass-refraction-premium" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
          <feOffset dx="1" dy="1" result="offsetBlur" />
          <feComposite in="offsetBlur" in2="SourceAlpha" operator="out" result="inverse" />
          <feFlood floodColor="white" floodOpacity="0.4" result="color" />
          <feComposite in="color" in2="inverse" operator="in" result="shadow" />
          <feComposite in="shadow" in2="SourceAlpha" operator="in" />
        </filter>
        <linearGradient id="gold-gradient-premium" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D97706" />
          <stop offset="50%" stopColor="#FBDB8B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <radialGradient id="emerald-glow-premium" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </radialGradient>
      </defs>
      {glow && (
        <circle cx="20" cy="20" r="16" fill="url(#emerald-glow-premium)" className="animate-pulse" />
      )}
      {children}
    </svg>
  </div>
);

export const StudioIcon = ({ className, size = 24, glow }: IconProps) => (
  <PremiumIconWrapper size={size} glow={glow} className={className}>
    {/* Refractive Glass Base */}
    <rect x="8" y="8" width="24" height="24" rx="2" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" filter="url(#glass-refraction-premium)" />
    {/* Gold Inlay (Pen + Focus) */}
    <path d="M14 26L26 14M22 10L30 18L18 30L10 22L18 14" stroke="url(#gold-gradient-premium)" strokeWidth="2" strokeLinecap="round" />
    <circle cx="20" cy="20" r="4" stroke="url(#gold-gradient-premium)" strokeWidth="1.5" strokeDasharray="2 2" />
  </PremiumIconWrapper>
);

export const HubIcon = ({ className, size = 24, glow }: IconProps) => (
  <PremiumIconWrapper size={size} glow={glow} className={className}>
    {/* Refractive Glass Base (Hexagon) */}
    <path d="M20 4L34 12V28L20 36L6 28V12L20 4Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" filter="url(#glass-refraction-premium)" />
    {/* Gold Inlay (Grid) */}
    <path d="M20 4V36M6 12L34 28M34 12L6 28" stroke="url(#gold-gradient-premium)" strokeWidth="1.5" strokeDasharray="1 3" />
    <circle cx="20" cy="20" r="5" stroke="url(#gold-gradient-premium)" strokeWidth="2" fill="rgba(217,119,6,0.1)" />
  </PremiumIconWrapper>
);

export const IntelligenceIcon = ({ className, size = 24, glow }: IconProps) => (
  <PremiumIconWrapper size={size} glow={glow} className={className}>
    {/* Refractive Glass Base (Crystal) */}
    <path d="M20 6L32 20L20 34L8 20L20 6Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" filter="url(#glass-refraction-premium)" />
    {/* Gold Inlay (Neural) */}
    <circle cx="20" cy="14" r="2" fill="url(#gold-gradient-premium)" />
    <circle cx="14" cy="24" r="2" fill="url(#gold-gradient-premium)" />
    <circle cx="26" cy="24" r="2" fill="url(#gold-gradient-premium)" />
    <path d="M20 14L14 24M20 14L26 24M14 24L26 24" stroke="url(#gold-gradient-premium)" strokeWidth="1" />
  </PremiumIconWrapper>
);

export const CommunityIcon = ({ className, size = 24, glow }: IconProps) => (
  <PremiumIconWrapper size={size} glow={glow} className={className}>
    <circle cx="20" cy="20" r="14" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" filter="url(#glass-refraction-premium)" />
    <path d="M20 12C17.7909 12 16 13.7909 16 16C16 18.2091 17.7909 20 20 20C22.2091 20 24 18.2091 24 16C24 13.7909 22.2091 12 20 12Z" stroke="url(#gold-gradient-premium)" strokeWidth="2" />
    <path d="M12 28C12 24.6863 15.5817 22 20 22C24.4183 22 28 24.6863 28 28" stroke="url(#gold-gradient-premium)" strokeWidth="2" strokeLinecap="round" />
  </PremiumIconWrapper>
);

export const RoadmapIcon = ({ className, size = 24, glow }: IconProps) => (
  <PremiumIconWrapper size={size} glow={glow} className={className}>
    <circle cx="20" cy="20" r="14" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" filter="url(#glass-refraction-premium)" />
    <path d="M20 8L28 32H12L20 8Z" stroke="url(#gold-gradient-premium)" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="20" cy="20" r="2" fill="url(#gold-gradient-premium)" />
  </PremiumIconWrapper>
);

export const ProfileIcon = ({ className, size = 24, glow }: IconProps) => (
  <PremiumIconWrapper size={size} glow={glow} className={className}>
    <path d="M20 4L34 12V28L20 36L6 28V12L20 4Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" filter="url(#glass-refraction-premium)" />
    <circle cx="20" cy="16" r="4" stroke="url(#gold-gradient-premium)" strokeWidth="2" />
    <path d="M12 28C12 25 15 23 20 23C25 23 28 25 28 28" stroke="url(#gold-gradient-premium)" strokeWidth="2" strokeLinecap="round" />
  </PremiumIconWrapper>
);

export const SettingsIcon = ({ className, size = 24, glow }: IconProps) => (
  <PremiumIconWrapper size={size} glow={glow} className={className}>
    <circle cx="20" cy="20" r="10" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" filter="url(#glass-refraction-premium)" />
    <path d="M20 14V16M20 24V26M14 20H16M24 20H26M16 16L17.5 17.5M22.5 22.5L24 24M16 24L17.5 22.5M22.5 17.5L24 16" stroke="url(#gold-gradient-premium)" strokeWidth="2" />
    <circle cx="20" cy="20" r="2" fill="url(#gold-gradient-premium)" />
  </PremiumIconWrapper>
);

export const SearchIcon = ({ className, size = 24, glow }: IconProps) => (
  <PremiumIconWrapper size={size} glow={glow} className={className}>
    <circle cx="18" cy="18" r="10" stroke="url(#gold-gradient-premium)" strokeWidth="2" />
    <path d="M26 26L34 34" stroke="url(#gold-gradient-premium)" strokeWidth="2" strokeLinecap="round" />
  </PremiumIconWrapper>
);

export const GrowthIcon = ({ className, size = 24, glow }: IconProps) => (
  <PremiumIconWrapper size={size} glow={glow} className={className}>
    <path d="M6 34L14 22L22 28L34 10" stroke="url(#gold-gradient-premium)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="34" cy="10" r="3" fill="#10B981" />
  </PremiumIconWrapper>
);
