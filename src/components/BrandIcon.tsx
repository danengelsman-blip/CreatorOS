import React from 'react';
import { cn } from '../lib/utils';
import { Sparkles } from 'lucide-react';

interface BrandIconProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export default function BrandIcon({ className, size = 24, glow = false }: BrandIconProps) {
  return (
    <div className="relative flex items-center justify-center">
      {glow && (
        <div 
          className="absolute inset-0 bg-accent-gold/20 blur-[8px] rounded-full animate-pulse" 
          style={{ width: size * 1.5, height: size * 1.5 }} 
        />
      )}
      <Sparkles size={size} className={cn("relative z-10", className || "text-accent-gold")} />
    </div>
  );
}
