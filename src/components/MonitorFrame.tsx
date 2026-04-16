import React from 'react';
import { cn } from '@/src/lib/utils';

interface MonitorFrameProps {
  children: React.ReactNode;
}

export const MonitorFrame: React.FC<MonitorFrameProps> = ({ children }) => {
  return (
    <div className="h-[100svh] bg-[#050505] flex items-center justify-center p-0 md:p-2 lg:p-6 overflow-hidden">
      {/* MacBook-style Frame: Full screen on mobile, framed on desktop */}
      <div className="relative w-full h-[100svh] md:max-w-[1200px] md:h-[98vh] lg:h-[92vh] md:max-h-[900px] bg-[#050505] md:bg-[#d1d1d1] md:rounded-[24px] md:p-1 shadow-none md:shadow-[0_50px_100px_-20px_rgba(0,0,0,0.7)] flex flex-col transition-all duration-500 overflow-hidden">
        
        {/* Screen Bezel */}
        <div className="relative flex-1 bg-black md:rounded-[20px] md:m-2 overflow-hidden flex flex-col shadow-inner">
          
          {/* Top Notch Area (Subtle) - Desktop Only */}
          <div className="hidden md:flex h-6 w-full justify-center items-start pt-1">
            <div className="w-32 h-4 bg-black rounded-b-xl flex items-center justify-center gap-2">
              <div className="w-1 h-1 rounded-full bg-[#1a1a1a]" />
              <div className="w-1.5 h-1.5 rounded-full bg-[#0a0a0a] border border-[#222]" />
            </div>
          </div>

          {/* The Actual Screen Content */}
          <div className="relative flex-1 overflow-hidden bg-retro-bg crt-flicker">
            {children}
            
            {/* Screen Effects */}
            <div className="crt-overlay pointer-events-none" />
            <div className="scanline-effect pointer-events-none" />
            <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.3)]" />
          </div>
        </div>

        {/* MacBook Bottom Lip - Desktop Only */}
        <div className="hidden md:flex h-8 w-full items-center justify-center">
          <div className="text-[10px] font-medium text-[#666] tracking-[0.2em] uppercase opacity-50">SamirBook Pro</div>
        </div>

        {/* Subtle reflection on the frame - Desktop Only */}
        <div className="hidden md:block absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-[24px]" />
      </div>
    </div>
  );
};
