import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useDragControls } from 'motion/react';
import { Folder, User, Code, Mail, X, Minus, Square, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { ScrambleText } from '@/src/components/ScrambleText';
import { playWindowOpen, playWindowClose, playMailSuccess, playKeyClack } from '@/src/lib/sounds';

const aboutPhotoSrc = '/images/about-samir.jpg';
const luckyStrikeScreenshots = [
  '/images/lucky-strike-1.jpg',
  '/images/lucky-strike-2.jpg',
  '/images/lucky-strike-3.jpg',
];
const githubProfileUrl = 'https://github.com/sammythaitiger';
const thaiToneLabUrl = 'https://github.com/sammythaitiger/ThaiTone-Lab';
const freeTorrentsWikiUrl = 'https://ru.wikipedia.org/wiki/Free-Torrents.org';
const contactApiUrl = ((import.meta as ImportMeta & { env?: { VITE_CONTACT_API_URL?: string } }).env?.VITE_CONTACT_API_URL) ?? '/api/contact';

const MatrixBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~";
    const fontSize = 10;
    const columns = canvas.width / fontSize;
    const drops: number[] = [];

    for (let i = 0; i < columns; i++) {
      drops[i] = 1;
    }

    const draw = () => {
      ctx.fillStyle = 'rgba(12, 12, 12, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0F0';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = characters.charAt(Math.floor(Math.random() * characters.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);    

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);
    return () => clearInterval(interval);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 opacity-10 pointer-events-none" />;
};

interface WindowProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  children: React.ReactNode;
  zIndex: number;
  onFocus: () => void;
  position: { x: number; y: number };
  onPositionChange: (position: { x: number; y: number }) => void;
  desktopRef: React.RefObject<HTMLDivElement | null>;
  isDesktop: boolean;
  supportsWindowChrome: boolean;
  maxWidth?: string;
}

const WINDOW_INSET = 12;
const TASKBAR_HEIGHT = 40;

const Window: React.FC<WindowProps> = ({
  id,
  title,
  icon,
  isOpen,
  isMinimized,
  isMaximized,
  onClose,
  onMinimize,
  onMaximize,
  children,
  zIndex,
  onFocus,
  position,
  onPositionChange,
  desktopRef,
  isDesktop,
  supportsWindowChrome,
  maxWidth = "56rem",
}) => {
  const dragControls = useDragControls();
  const windowRef = useRef<HTMLDivElement>(null);

  const clampIntoViewport = (nextPosition: { x: number; y: number }) => {
    const desktopNode = desktopRef.current;
    const windowNode = windowRef.current;

    if (!desktopNode || !windowNode) {
      return nextPosition;
    }

    const maxX = Math.max(WINDOW_INSET, desktopNode.clientWidth - windowNode.offsetWidth - WINDOW_INSET);
    const maxY = Math.max(WINDOW_INSET, desktopNode.clientHeight - windowNode.offsetHeight - TASKBAR_HEIGHT - WINDOW_INSET);

    return {
      x: Math.min(Math.max(WINDOW_INSET, nextPosition.x), maxX),
      y: Math.min(Math.max(WINDOW_INSET, nextPosition.y), maxY),
    };
  };

  // Clamp size to the remaining space from the window's top-left corner.
  // Without this, a window positioned mid-viewport can extend past the taskbar
  // or right edge, and the user has to drag the window to reach hidden content.
  const boundedSizeStyle = supportsWindowChrome
    ? isMaximized
      ? { maxHeight: `calc(100% - ${TASKBAR_HEIGHT}px)` }
      : {
          maxWidth: `min(${maxWidth}, calc(100% - ${position.x + WINDOW_INSET}px))`,
          maxHeight: `calc(100% - ${position.y + TASKBAR_HEIGHT + WINDOW_INSET}px)`,
        }
    : undefined;

  return (
    <AnimatePresence>
      {isOpen && !isMinimized && (
        <motion.div
          key={`${id}-${isMaximized ? 'max' : 'window'}`}
          ref={windowRef}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          drag={isDesktop && !isMaximized}
          dragControls={dragControls}
          dragListener={isDesktop && !isMaximized}
          dragMomentum={false}
          onDragEnd={(_, info) => {
            onPositionChange(clampIntoViewport({
              x: position.x + info.offset.x,
              y: position.y + info.offset.y,
            }));
          }}
          onMouseDown={onFocus}
          className={cn(
            "bg-[#1a1a1a] border-[#333] shadow-2xl flex flex-col overflow-hidden z-40",
            supportsWindowChrome
              ? "absolute border-2 rounded-sm"
              : "fixed inset-x-0 top-0 bottom-10 w-full border-0 rounded-t-xl",
            supportsWindowChrome && isMaximized && "inset-x-0 top-0 bottom-10 w-auto h-auto",
            supportsWindowChrome && !isMaximized && "w-[92%]",
            isDesktop && !isMaximized && "cursor-move",
          )}
          style={
            supportsWindowChrome
              ? isMaximized
                ? { zIndex, left: 0, top: 0, right: 0, bottom: TASKBAR_HEIGHT, ...boundedSizeStyle }
                : { zIndex, left: position.x, top: position.y, ...boundedSizeStyle }
              : { zIndex }
          }
        >
          {/* Title Bar */}
          <div
            onPointerDown={(event) => {
              onFocus();
            }}
            onDoubleClick={() => {
              if (supportsWindowChrome) {
                onMaximize();
              }
            }}
            className={cn(
              "bg-[#222] md:bg-[#333] p-3 md:p-2 flex items-center justify-between select-none border-b border-[#333] shrink-0",
              isDesktop && !isMaximized && "cursor-move"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-retro-green">{icon}</span>
              <span className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-wider truncate max-w-[150px] md:max-w-none">{title}</span>
            </div>
            <div className="flex gap-3 md:gap-2">
              <button
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onMinimize();
                }}
                className="hidden md:block hover:bg-[#444] p-1 rounded-sm transition-colors"
              >
                <Minus size={14} />
              </button>
              <button
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onMaximize();
                }}
                className={cn(
                  "hidden md:block p-1 rounded-sm transition-colors",
                  isMaximized ? "bg-[#444] text-white" : "hover:bg-[#444]"
                )}
              >
                <Square size={14} />
              </button>
              <button 
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="hover:bg-red-500 p-1.5 md:p-1 rounded-sm transition-colors"
              >
                <X size={18} className="md:w-3.5 md:h-3.5" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-auto p-4 md:p-6 font-mono text-xs md:text-sm leading-relaxed custom-scrollbar pb-24 md:pb-6">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

type WindowId = 'about' | 'projects' | 'skills' | 'contact';

interface WindowRuntimeState {
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
}

const defaultWindowRuntimeState: Record<WindowId, WindowRuntimeState> = {
  about: { isOpen: false, isMinimized: false, isMaximized: false, position: { x: 88, y: 48 } },
  projects: { isOpen: false, isMinimized: false, isMaximized: false, position: { x: 120, y: 72 } },
  skills: { isOpen: false, isMinimized: false, isMaximized: false, position: { x: 152, y: 96 } },
  contact: { isOpen: false, isMinimized: false, isMaximized: false, position: { x: 184, y: 120 } },
};

const windowCascadeOrder: Record<WindowId, number> = {
  about: 0,
  projects: 1,
  skills: 2,
  contact: 3,
};

const INSTALL_PACKAGES = [
  { name: 'react',               version: '19.0.0',  color: 'text-retro-green' },
  { name: 'react-native',        version: '0.76.5',  color: 'text-retro-green' },
  { name: 'expo',                version: '52.0.0',  color: 'text-retro-green' },
  { name: 'next',                version: '15.3.0',  color: 'text-retro-green' },
  { name: 'typescript',          version: '5.8.2',   color: 'text-retro-green' },
  { name: 'tailwindcss',         version: '4.1.14',  color: 'text-retro-green' },
  { name: 'node',                version: '22.0.0',  color: 'text-blue-400'    },
  { name: 'postgresql',          version: '16.2.0',  color: 'text-blue-400'    },
  { name: 'redis',               version: '8.0.0',   color: 'text-blue-400'    },
  { name: 'docker',              version: '27.3.1',  color: 'text-blue-400'    },
  { name: '@samir/leadership',   version: '12.0.0',  color: 'text-retro-amber' },
  { name: '@samir/delivery',     version: '10.0.0',  color: 'text-retro-amber' },
  { name: '@samir/product-ops',  version: '8.0.0',   color: 'text-retro-amber' },
] as const;

const SKILL_BARS = [
  { label: 'Production Leadership', pct: 99, hex: '#f59e0b' },
  { label: 'Team Management',       pct: 97, hex: '#f59e0b' },
  { label: 'React / React Native',  pct: 95, hex: '#33ff33' },
  { label: 'TypeScript',            pct: 92, hex: '#33ff33' },
  { label: 'Expo / Mobile',         pct: 85, hex: '#33ff33' },
  { label: 'Node.js / Backend',     pct: 80, hex: '#60a5fa' },
  { label: 'DevOps / Infra',        pct: 70, hex: '#60a5fa' },
] as const;

const SkillsTerminal: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
  const [revealed, setRevealed] = useState(0);
  const [barsActive, setBarsActive] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setRevealed(0);
      setBarsActive(false);
      setDone(false);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const PKG_DELAY = 140;

    INSTALL_PACKAGES.forEach((_, i) => {
      timers.push(setTimeout(() => setRevealed(i + 1), 600 + i * PKG_DELAY));
    });

    const lastPkg = 600 + (INSTALL_PACKAGES.length - 1) * PKG_DELAY;
    timers.push(setTimeout(() => setBarsActive(true), lastPkg + 500));
    timers.push(setTimeout(() => setDone(true), lastPkg + 1400));

    return () => timers.forEach(clearTimeout);
  }, [isOpen]);

  const totalTime = ((600 + (INSTALL_PACKAGES.length - 1) * 140 + 200) / 1000).toFixed(1);

  return (
    <div className="font-mono text-xs leading-5">
      <div className="text-retro-green/60 mb-3">
        <span className="text-retro-amber">samir</span>
        <span className="text-white/40">@sammy-os</span>
        <span className="text-white/25">:~$ </span>
        <span className="text-white/90">npm install @samir/skills</span>
      </div>

      {revealed > 0 && (
        <div className="text-white/30 mb-2 space-y-0.5">
          <div>npm warn saveError ENOENT: no such file or directory</div>
          <div>npm notice created a lockfile as package-lock.json</div>
          <div>npm warn optional SKIPPING OPTIONAL DEPENDENCY: node-gyp</div>
        </div>
      )}

      <div className="space-y-0.5 mb-2">
        {INSTALL_PACKAGES.slice(0, revealed).map((pkg) => (
          <div key={pkg.name} className="flex items-center gap-2">
            <span className="text-retro-green shrink-0">✓</span>
            <span className={cn('shrink-0', pkg.color)}>{pkg.name}</span>
            <span className="text-white/30">@{pkg.version}</span>
          </div>
        ))}
      </div>

      {revealed >= INSTALL_PACKAGES.length && (
        <div className="text-white/60 mb-4">
          added {INSTALL_PACKAGES.length} packages in {totalTime}s
        </div>
      )}

      {barsActive && (
        <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
          <div className="text-retro-amber uppercase tracking-[0.25em] text-[9px] mb-3">
            skill matrix initialized
          </div>
          {SKILL_BARS.map((bar, i) => (
            <div key={bar.label} className="flex items-center gap-2">
              <div className="w-36 shrink-0 text-white/50 text-[10px] truncate">{bar.label}</div>
              <div className="flex-1 h-1.5 bg-white/5 overflow-hidden">
                <div
                  style={{
                    width: `${bar.pct}%`,
                    backgroundColor: bar.hex,
                    height: '100%',
                    transition: `width 0.7s ease-out ${i * 80}ms`,
                    boxShadow: `0 0 6px ${bar.hex}66`,
                  }}
                />
              </div>
              <div className="w-8 text-right text-[9px]" style={{ color: bar.hex }}>{bar.pct}%</div>
            </div>
          ))}
        </div>
      )}

      {done && (
        <div className="mt-4 space-y-0.5">
          <div className="text-retro-green/70">&gt; @samir/skills@1.0.0 postinstall</div>
          <div className="text-white/30">&gt; echo "all systems operational"</div>
          <div className="text-retro-green mt-1">all systems operational</div>
          <div className="text-white/20 mt-2">
            <span className="text-retro-amber">samir</span>
            <span className="text-white/20">@sammy-os</span>
            <span className="text-white/15">:~$ </span>
            <span className="animate-pulse">█</span>
          </div>
        </div>
      )}
    </div>
  );
};

const GlitchText: React.FC<{ onCharReveal?: () => void }> = ({ onCharReveal }) => {
  return (
    <div className="relative pointer-events-none select-none flex flex-col items-center justify-center w-full max-w-full px-4 text-center">
      <div className="relative w-full flex justify-center">
        {/* Main Text — metallic gradient + shimmer */}
        <div className="text-lux-red text-4xl sm:text-5xl md:text-8xl font-black tracking-tighter uppercase relative z-10 break-words w-full">
          <ScrambleText text="Samir Akhmedoff" duration={1400} onReveal={onCharReveal} />
        </div>

        {/* Chromatic aberration ghosts */}
        <motion.div
          animate={{
            opacity: [0.35, 0.35, 0.75, 0.35, 0.9, 0.35, 0.35],
            x: [-2, -2, -9, -3, -2, -4, -2],
            skewX: [0, 15, -15, 0, 8, 0, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            times: [0, 0.1, 0.12, 0.14, 0.16, 0.18, 1],
          }}
          className="absolute inset-0 text-4xl sm:text-5xl md:text-8xl font-black text-[#00e5ff] tracking-tighter uppercase blur-[0.5px] z-0 flex justify-center w-full mix-blend-screen"
        >
          Samir Akhmedoff
        </motion.div>

        <motion.div
          animate={{
            opacity: [0.35, 0.7, 0.35, 0.85, 0.35, 0.35],
            x: [2, 9, 2, 5, 2, 2],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            times: [0, 0.2, 0.22, 0.24, 0.26, 1],
            delay: 1,
          }}
          className="absolute inset-0 text-4xl sm:text-5xl md:text-8xl font-black text-[#ff0080] tracking-tighter uppercase blur-[0.5px] z-0 flex justify-center w-full mix-blend-screen"
        >
          Samir Akhmedoff
        </motion.div>
      </div>

      <motion.div
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="text-lux-red text-aberration text-sm sm:text-base md:text-2xl font-mono mt-2 md:mt-4 tracking-[0.1em] sm:tracking-[0.2em] md:tracking-[0.6em] uppercase"
      >
        Senior Production Leader
      </motion.div>
    </div>
  );
};

const Clippy: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.5 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.5 }}
          className="fixed bottom-12 right-4 z-[100] flex flex-col items-end"
        >
          <div className="bg-[#FFFFE1] border-2 border-black p-3 rounded-xl shadow-xl mb-2 relative max-w-[150px]">
            <p className="text-black text-[10px] sm:text-xs font-sans font-bold leading-tight">
              Похоже, вы пытаетесь нажать на часы?
              <br /><br />
              <span className="text-red-600 text-xs sm:text-sm uppercase">пошел нахуй</span>
            </p>
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-[#FFFFE1] border-r-2 border-b-2 border-black rotate-45" />
          </div>
          <div className="relative cursor-pointer group" onClick={onClose}>
            {/* SVG Clippy as fallback for broken images */}
            <div className="w-16 h-16 flex items-center justify-center animate-bounce">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                <path d="M40,20 L40,80 C40,90 60,90 60,80 L60,30 C60,25 50,25 50,30 L50,70" fill="none" stroke="#888" strokeWidth="4" strokeLinecap="round" />
                <circle cx="45" cy="40" r="5" fill="white" stroke="black" strokeWidth="1" />
                <circle cx="55" cy="40" r="5" fill="white" stroke="black" strokeWidth="1" />
                <circle cx="46" cy="41" r="2" fill="black" />
                <circle cx="56" cy="41" r="2" fill="black" />
                <path d="M42,32 Q50,28 58,32" fill="none" stroke="black" strokeWidth="1" />
              </svg>
            </div>
            <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
              <X size={12} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const TacticalLocationPanel: React.FC = () => {
  return (
    <div className="group relative overflow-hidden border border-retro-green/25 bg-[#061106]/95 p-3 md:p-4 hover:animate-[flicker_0.24s_steps(2,end)_3]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(51,255,51,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(51,255,51,0.045)_1px,transparent_1px)] bg-[size:24px_24px] opacity-70" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(51,255,51,0.12),transparent_62%)] opacity-80" />
      <div className="absolute inset-x-0 top-0 h-px bg-retro-green/60" />

      <div className="relative z-10 mb-3 flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.3em] text-retro-amber">Current Location</div>
          <div className="mt-1 text-base md:text-lg font-bold text-retro-green">Bangkok, Thailand</div>
        </div>
        <div className="text-right text-[10px] uppercase tracking-[0.2em] text-retro-green/70">
          <div>Node Active</div>
          <div>GMT+7</div>
        </div>
      </div>

      <div className="relative z-10 grid gap-3 md:grid-cols-[minmax(0,1fr)_160px] items-start">
        <div className="relative overflow-hidden border border-retro-green/20 bg-black/40 p-2 h-[190px]">
          <div className="absolute inset-0 opacity-35 pointer-events-none">
            <div className="absolute inset-x-0 top-[20%] border-t border-retro-green/20" />
            <div className="absolute inset-x-0 top-[40%] border-t border-retro-green/20" />
            <div className="absolute inset-x-0 top-[60%] border-t border-retro-green/20" />
            <div className="absolute inset-x-0 top-[80%] border-t border-retro-green/20" />
            <div className="absolute inset-y-0 left-[20%] border-l border-retro-green/20" />
            <div className="absolute inset-y-0 left-[40%] border-l border-retro-green/20" />
            <div className="absolute inset-y-0 left-[60%] border-l border-retro-green/20" />
            <div className="absolute inset-y-0 left-[80%] border-l border-retro-green/20" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative h-40 w-40 rounded-full border border-retro-green/20">
              <div className="absolute inset-3 rounded-full border border-retro-green/20" />
              <div className="absolute inset-7 rounded-full border border-retro-green/25" />
              <div className="absolute inset-1/2 h-px w-full -translate-x-1/2 -translate-y-1/2 bg-retro-green/20" />
              <div className="absolute inset-1/2 h-full w-px -translate-x-1/2 -translate-y-1/2 bg-retro-green/20" />
              <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_220deg,transparent_0deg,rgba(51,255,51,0.03)_80deg,rgba(51,255,51,0.22)_98deg,transparent_112deg,transparent_360deg)] animate-[spin_9s_linear_infinite]" />
              <div className="absolute left-[63%] top-[41%] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-retro-green shadow-[0_0_12px_rgba(51,255,51,0.95)]" />
              <div className="absolute left-[63%] top-[41%] h-9 w-9 -translate-x-1/2 -translate-y-1/2 rounded-full border border-retro-green/45 animate-ping" />
            </div>
          </div>

          <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3">
            <div className="text-[10px] uppercase tracking-[0.28em] text-retro-green/70">Target Lock</div>
            <div className="mt-3 text-xl md:text-2xl font-bold uppercase tracking-[0.18em] text-retro-green">Bangkok</div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-retro-amber">Thailand / GMT+7</div>
          </div>
        </div>

        <div className="space-y-3 text-[10px] uppercase tracking-[0.22em]">
          <div className="border border-retro-green/20 bg-retro-green/8 px-3 py-2">
            <div className="text-retro-amber mb-1">Sector</div>
            <div className="text-retro-green">Southeast Asia</div>
          </div>
          <div className="border border-retro-green/20 bg-black/35 px-3 py-2">
            <div className="text-retro-amber mb-1">Signal</div>
            <div className="text-retro-green">Uplink Stable</div>
          </div>
          <div className="border border-retro-green/20 bg-black/35 px-3 py-2">
            <div className="text-retro-amber mb-1">Status</div>
            <div className="text-retro-green">Operational</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Desktop: React.FC = () => {
  const desktopRef = useRef<HTMLDivElement>(null);
  const [windows, setWindows] = useState<Record<WindowId, WindowRuntimeState>>(defaultWindowRuntimeState);
  const [windowOrder, setWindowOrder] = useState<WindowId[]>([]);
  const [activeWindow, setActiveWindow] = useState<WindowId | null>(null);
  const [clippyVisible, setClippyVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundRef = useRef(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [contactError, setContactError] = useState<string | null>(null);
  const [viewportMode, setViewportMode] = useState<'mobile' | 'compact' | 'desktop'>('mobile');

  useEffect(() => { soundRef.current = soundEnabled; }, [soundEnabled]);

  useEffect(() => {
    if (contactStatus === 'success' && soundRef.current) playMailSuccess();
  }, [contactStatus]);
  const isDesktop = viewportMode === 'desktop';
  const supportsWindowChrome = viewportMode !== 'mobile';

  useEffect(() => {
    const updateViewport = () => {
      if (window.innerWidth >= 1280) {
        setViewportMode('desktop');
        return;
      }

      if (window.innerWidth >= 768) {
        setViewportMode('compact');
        return;
      }

      setViewportMode('mobile');
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const bringToFront = (id: WindowId) => {
    setWindowOrder((current) => [...current.filter((item) => item !== id), id]);
    setActiveWindow(id);
  };

  const getInitialWindowPosition = (id: WindowId) => {
    if (!supportsWindowChrome) {
      return defaultWindowRuntimeState[id].position;
    }

    const desktopNode = desktopRef.current;

    if (!desktopNode) {
      return defaultWindowRuntimeState[id].position;
    }

    const inset = 16;
    const taskbarHeight = 40;
    const cascadeOffset = viewportMode === 'desktop' ? 24 : 16;
    const cascadeIndex = windowCascadeOrder[id];
    const usableWidth = desktopNode.clientWidth;
    const usableHeight = desktopNode.clientHeight - taskbarHeight;
    const estimatedWidth = id === 'contact'
      ? Math.min(560, usableWidth - inset * 2)
      : Math.min(1100, Math.max(usableWidth * 0.82, 760));
    const estimatedHeight = id === 'contact'
      ? Math.min(560, Math.max(usableHeight * 0.72, 480))
      : Math.min(760, Math.max(usableHeight * 0.78, 520));
    const maxX = Math.max(inset, usableWidth - estimatedWidth - inset);
    const maxY = Math.max(inset, usableHeight - estimatedHeight - inset);
    const centeredX = (usableWidth - estimatedWidth) / 2;
    const centeredY = (usableHeight - estimatedHeight) / 2;

    return {
      x: Math.min(Math.max(inset, centeredX + cascadeIndex * cascadeOffset), maxX),
      y: Math.min(Math.max(inset, centeredY + cascadeIndex * cascadeOffset), maxY),
    };
  };

  const toggleWindow = (id: WindowId) => {
    if (soundRef.current) playWindowOpen();
    setWindows((current) => {
      const shouldResetPosition = !current[id].isOpen;

      return {
        ...current,
        [id]: {
          ...current[id],
          isOpen: true,
          isMinimized: false,
          position: shouldResetPosition ? getInitialWindowPosition(id) : current[id].position,
        },
      };
    });

    if (supportsWindowChrome) {
      bringToFront(id);
    } else {
      setWindowOrder([id]);
      setActiveWindow(id);
    }
  };

  const closeWindow = (id: WindowId) => {
    if (soundRef.current) playWindowClose();
    setWindows((current) => ({
      ...current,
      [id]: {
        ...current[id],
        isOpen: false,
        isMinimized: false,
        isMaximized: false,
      },
    }));
    setWindowOrder((current) => current.filter((item) => item !== id));
    setActiveWindow((current) => (current === id ? null : current));

    if (id === 'contact') {
      setContactMessage('');
      setContactStatus('idle');
      setContactError(null);
    }
  };

  const minimizeWindow = (id: WindowId) => {
    setWindows((current) => ({
      ...current,
      [id]: {
        ...current[id],
        isMinimized: true,
      },
    }));
    setActiveWindow((current) => (current === id ? null : current));
  };

  const maximizeWindow = (id: WindowId) => {
    if (!supportsWindowChrome) {
      return;
    }

    setWindows((current) => ({
      ...current,
      [id]: {
        ...current[id],
        isMaximized: !current[id].isMaximized,
        isMinimized: false,
      },
    }));
    bringToFront(id);
  };

  const restoreWindow = (id: WindowId) => {
    if (soundRef.current) playWindowOpen();
    setWindows((current) => ({
      ...current,
      [id]: {
        ...current[id],
        isOpen: true,
        isMinimized: false,
      },
    }));
    bringToFront(id);
  };

  const updateWindowPosition = (id: WindowId, position: { x: number; y: number }) => {
    setWindows((current) => ({
      ...current,
      [id]: {
        ...current[id],
        position,
      },
    }));
  };

  const sendContactTransmission = async () => {
    const message = contactMessage.trim();

    if (!message) {
      setContactError('Add a message before sending.');
      return;
    }

    setContactStatus('sending');
    setContactError(null);

    try {
      const response = await fetch(contactApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Transmission failed.');
      }

      setContactStatus('success');
      setContactMessage('');
    } catch (error) {
      setContactStatus('error');
      setContactError(error instanceof Error ? error.message : 'Transmission failed.');
    }
  };

  const icons: Array<{ id: WindowId; title: string; icon: React.ReactNode; color: string }> = [
    { id: 'about', title: 'About_Me.txt', icon: <User size={32} />, color: 'text-blue-400' },
    { id: 'projects', title: 'Projects', icon: <Folder size={32} />, color: 'text-yellow-400' },
    { id: 'skills', title: 'Skills.exe', icon: <Code size={32} />, color: 'text-green-400' },
    { id: 'contact', title: 'Contact.sh', icon: <Mail size={32} />, color: 'text-purple-400' },
  ];

  return (
    <div ref={desktopRef} className="relative w-full h-[100svh] md:h-full px-4 pt-4 pb-14 md:p-6 select-none overflow-hidden">
      <MatrixBackground />
      
      {/* Glitch Text Background */}
      <div className="absolute top-[54%] md:top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-full flex justify-center items-center">
        <GlitchText onCharReveal={soundRef.current ? playKeyClack : undefined} />
      </div>

      {/* Desktop Icons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-1 gap-4 md:gap-8 w-full md:w-fit relative z-10 pt-4 md:pt-0">
        {icons.map((item) => (
          <motion.button
            key={item.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => toggleWindow(item.id)}
            className="flex flex-col items-center gap-1 md:gap-2 w-full md:w-20 group"
          >
            <div className={cn("p-2 md:p-3 rounded-lg transition-colors group-hover:bg-white/10", item.color)}>
              {item.icon}
            </div>
            <span className="text-[9px] md:text-[10px] font-mono text-center break-all leading-tight">
              {item.title}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Windows */}
      <Clippy visible={clippyVisible} onClose={() => setClippyVisible(false)} />
      
      <Window
        id="about"
        title="About_Me.txt"
        icon={<User size={16} />}
        isOpen={windows.about.isOpen}
        isMinimized={windows.about.isMinimized}
        isMaximized={windows.about.isMaximized}
        onClose={() => closeWindow('about')}
        onMinimize={() => minimizeWindow('about')}
        onMaximize={() => maximizeWindow('about')}
        zIndex={20 + windowOrder.indexOf('about')}
        onFocus={() => bringToFront('about')}
        position={windows.about.position}
        onPositionChange={(position) => updateWindowPosition('about', position)}
        desktopRef={desktopRef}
        isDesktop={isDesktop}
        supportsWindowChrome={supportsWindowChrome}
      >
        <div className="flex flex-col gap-8">
          <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
            {/* Stylized Photo */}
            <motion.div 
              initial={{ opacity: 0, x: -50, rotateY: 90 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="relative w-full max-w-[280px] md:max-w-[340px] mx-auto lg:mx-0 lg:w-64 aspect-[5/4] lg:aspect-square shrink-0 group"
            >
              <div className="absolute inset-0 bg-red-600/20 blur-xl group-hover:bg-red-600/40 transition-colors duration-500" />
              <div className="relative w-full h-full border-2 border-red-600 overflow-hidden bg-[#111] grayscale contrast-125 brightness-90 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700">
                <img 
                  src={aboutPhotoSrc}
                  alt="Samir Akhmedoff" 
                  className="w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent opacity-50" />
                <div className="absolute top-0 left-0 w-full h-px bg-red-600/35" />
              </div>
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-red-500" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-red-500" />
            </motion.div>

          <div className="space-y-4 flex-1 min-w-0">
            <h2
              className="group text-xl md:text-2xl border-b border-red-900/30 pb-2 flex items-center gap-2 font-black tracking-[0.02em] cursor-default"
              title="SYSTEM_ARCHITECT: SAMIR_AKHMEDOFF"
            >
              <span className="animate-pulse text-red-500 text-neon-red">●</span>
              <span className="text-lux-red text-aberration">
                <ScrambleText
                  text="SYSTEM_ARCHITECT: SAMIR_AKHMEDOFF"
                  duration={1100}
                  trigger={windows.about.isOpen}
                  onReveal={soundEnabled ? playKeyClack : undefined}
                />
              </span>
            </h2>
            <div className="space-y-4 text-sm md:text-base leading-relaxed">
              <p className="text-retro-green font-bold text-lg md:text-xl tracking-tight">
                Senior Production Leader with hands-on product engineering experience.
              </p>
              <p className="text-retro-green/90">
                I combine large-scale production leadership with direct product development. My background allows
                me to move confidently between strategy, delivery, team management, architecture, and hands-on
                implementation across web, mobile, and backend products.
              </p>
              <div className="space-y-3 border-l-2 border-red-600/50 pl-3 md:pl-4 py-1 bg-red-600/5">
                <div>
                  <span className="text-lux-red text-aberration font-black uppercase text-[10px] tracking-[0.2em] block mb-1">Current_Focus:</span>
                  <p className="text-xs md:text-sm">
                    <a
                      href={thaiToneLabUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white font-bold underline decoration-red-600/40 underline-offset-3 hover:text-red-400"
                    >
                      Thai Tone Lab
                    </a>{' '}
                    — a full-cycle mobile product I am designing and building with
                    <span className="text-retro-amber"> Expo, React Native, React Native Paper</span>,
                    <span className="text-retro-amber"> Python</span>, and product-first delivery discipline.
                  </p>
                </div>
                <div>
                  <span className="text-lux-red text-aberration font-black uppercase text-[10px] tracking-[0.2em] block mb-1">Execution_Model:</span>
                  <p className="text-xs md:text-sm">
                    I bring both sides of the equation: strong delivery leadership and the ability to step
                    directly into execution. That means fewer gaps between idea, team alignment,
                    implementation, and release.
                  </p>
                </div>
                <div>
                  <span className="text-lux-red text-aberration font-black uppercase text-[10px] tracking-[0.2em] block mb-1">Recent_Shipped_Work:</span>
                  <p className="text-xs md:text-sm">
                    I recently designed and developed this portfolio experience as well. More live code and product work
                    is available on:
                    {' '}
                    <a
                      href={githubProfileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-white font-bold underline decoration-red-600/40 underline-offset-3 hover:text-red-400"
                    >
                      github.com/sammythaitiger
                    </a>
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] md:text-xs pt-2">
                <div className="p-3 border border-retro-green/20 bg-retro-green/5 flex flex-col justify-center">
                  <span className="text-retro-amber block mb-1 uppercase tracking-widest font-bold">Strength:</span>
                  Strategy + Execution
                </div>
                <div className="p-3 border border-red-900/20 bg-red-900/5 flex flex-col justify-center group">
                  <span className="text-lux-red text-aberration block mb-1 uppercase tracking-widest font-bold">Range:</span>
                  Team Leadership + Hands-On Build
                </div>
              </div>
            </div>
          </div>
        </div>

        <TacticalLocationPanel />

        <div className="space-y-6">
            <h3 className="text-retro-amber border-b border-retro-amber/30 pb-1 uppercase tracking-widest">Experience_Log:</h3>

            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="text-retro-green font-bold">2023 – Present · Product Development & Shipping</h4>
                <span className="text-[10px] opacity-50">Apr 2023 – Present</span>
              </div>
              <p className="text-xs opacity-80 italic">Hands-on product engineering, delivery, and technical ownership</p>
              <div className="pl-4 border-l border-retro-green/30 space-y-2 mt-2">
                <p className="text-[11px] opacity-70">
                  Focused on direct development, product execution, and shipping working systems from idea to release.
                </p>
                <ul className="text-[11px] list-disc list-inside opacity-70">
                  <li>Building and launching products with React, React Native, Expo, Python, and Vite.</li>
                  <li>Designing frontend architecture, mobile flows, APIs, and release-ready product structure.</li>
                  <li>Owning delivery end-to-end: implementation, iteration, debugging, QA, and production readiness.</li>
                </ul>
              </div>
            </div>

            {/* VMLY&R */}
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="text-retro-green font-bold">VMLY&R (MA) · Digital Production Manager</h4>
                <span className="text-[10px] opacity-50">Aug 2021 – Apr 2023</span>
              </div>
              <p className="text-xs opacity-80 italic">American communications group</p>
              <div className="pl-4 border-l border-retro-green/30 space-y-3 mt-2">
                <div>
                  <p className="text-xs font-bold text-retro-amber underline">British American Tobacco (Lucky Strike):</p>
                  <ul className="text-[11px] list-disc list-inside opacity-70 mt-1">
                    <li>Led cross-functional teams across creative, account, design, and development.</li>
                    <li>Owned delivery of high-visibility digital launches and campaign systems.</li>
                    <li>Managed complex execution for brands including British American Tobacco and Aperol Spritz.</li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold text-retro-amber underline">Aperol Spritz:</p>
                  <ul className="text-[11px] list-disc list-inside opacity-70 mt-1">
                    <li>Coordinated platform, CRM, and campaign delivery in regulated market conditions.</li>
                    <li>Aligned stakeholders, production timelines, and vendor execution across multiple workstreams.</li>
                    <li>Maintained launch quality under tight deadlines and operational complexity.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Dentsu */}
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="text-retro-green font-bold">dentsu · Head of Digital Production</h4>
                <span className="text-[10px] opacity-50">Apr 2019 – Aug 2021</span>
              </div>
              <p className="text-xs opacity-80 italic">Global network advertising agency (Vizeum Health)</p>
              <div className="pl-4 border-l border-retro-green/30 space-y-2 mt-2">
                <ul className="text-[11px] list-disc list-inside opacity-70">
                  <li>Led the digital production function for pharmaceutical and brand clients.</li>
                  <li>Managed teams, vendors, timelines, and delivery quality across multiple parallel streams.</li>
                  <li>Oversaw websites, landing pages, banners, and campaign assets from planning to release.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Window>

      <Window
        id="projects"
        title="Projects"
        icon={<Folder size={16} />}
        isOpen={windows.projects.isOpen}
        isMinimized={windows.projects.isMinimized}
        isMaximized={windows.projects.isMaximized}
        onClose={() => closeWindow('projects')}
        onMinimize={() => minimizeWindow('projects')}
        onMaximize={() => maximizeWindow('projects')}
        zIndex={20 + windowOrder.indexOf('projects')}
        onFocus={() => bringToFront('projects')}
        position={windows.projects.position}
        onPositionChange={(position) => updateWindowPosition('projects', position)}
        desktopRef={desktopRef}
        isDesktop={isDesktop}
        supportsWindowChrome={supportsWindowChrome}
      >
        <div className="space-y-8">
          <a
            href={githubProfileUrl}
            target="_blank"
            rel="noreferrer"
            className="group relative block overflow-hidden border-2 border-retro-green bg-retro-green/10 px-4 py-3 text-center shadow-[0_0_0_rgba(51,255,51,0.0)] transition-all duration-300 hover:bg-retro-green/15 hover:shadow-[0_0_30px_rgba(51,255,51,0.35)]"
          >
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(51,255,51,0.18),transparent)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <div className="absolute inset-0 animate-pulse bg-retro-green/5" />
            <span className="relative inline-flex items-center justify-center gap-2 font-mono text-xs md:text-sm font-bold uppercase tracking-[0.25em] text-retro-green">
              Open Full GitHub Archive
              <span className="text-red-500 animate-pulse">●</span>
            </span>
          </a>

          {/* Lucky Strike Special Section */}
          <div className="border-2 border-red-600 p-3 md:p-4 bg-red-600/5">
            <h3 className="text-red-500 font-black uppercase tracking-[0.18em] md:tracking-widest mb-4 flex items-center gap-2 text-xs md:text-base">
              <span className="animate-ping w-2 h-2 bg-red-500 rounded-full" />
              Featured_Project: Lucky Strike (BAT)
            </h3>
            <div className="grid grid-flow-col auto-cols-[78%] sm:auto-cols-[52%] md:grid-flow-row md:auto-cols-auto md:grid-cols-3 gap-3 md:gap-4 mb-4 overflow-x-auto md:overflow-visible snap-x snap-mandatory no-scrollbar pr-1">
              {luckyStrikeScreenshots.map((src, i) => (
                <div 
                  key={i} 
                  className="aspect-[9/16] md:aspect-[9/19] border border-red-900/30 overflow-hidden group relative cursor-zoom-in snap-start"
                  onClick={() => setSelectedImage(src)}
                >
                  <img 
                    src={src} 
                    alt={`Lucky Strike ${i+1}`} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute inset-0 bg-red-600/10 group-hover:bg-transparent transition-colors" />
                </div>
              ))}
            </div>
            <p className="text-xs opacity-80 mb-2">Portal development and large-scale promo campaigns for British American Tobacco. Managed full-cycle production and custom digital assets.</p>
            <div className="text-[10px] font-bold text-red-500 uppercase">React, Node.js, SCRUM, Digital Production</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { 
                name: 'Thai Tone Lab', 
                desc: 'A mobile product for tonal analysis designed and built from concept to implementation.', 
                tech: 'Expo, React Native, RN Paper, Python',
                link: thaiToneLabUrl,
                badge: 'GITHUB',
              },
              { 
                name: 'Free-Torrents.org', 
                desc: 'Large-scale community platform and infrastructure project with deep customization, operational complexity, and long-term system ownership.', 
                tech: 'phpBB, Infrastructure, Server-Side',
                link: freeTorrentsWikiUrl,
                badge: 'WIKI',
              },
              { 
                name: 'Parliament.ru', 
                desc: 'Digital promo campaigns and frontend architecture.', 
                tech: 'React, Node.js, CSS-in-JS' 
              },
              { 
                name: 'Nestle Health Science', 
                desc: 'E-commerce and informational platforms.', 
                tech: 'Full-stack, Production Management' 
              },
            ].map((project, i) => (
              <a
                key={i}
                href={project.link}
                target={project.link ? '_blank' : undefined}
                rel={project.link ? 'noreferrer' : undefined}
                className={cn(
                  "border border-[#333] p-4 transition-colors group bg-black/20 block",
                  project.link ? "cursor-pointer hover:border-red-600" : "cursor-default"
                )}
              >
                <h3 className="text-retro-green mb-1 group-hover:text-red-500 transition-colors flex justify-between items-center">
                  {project.name}
                  {project.link && <span className="text-[8px] border border-red-900 px-1 text-red-900">{project.badge}</span>}
                </h3>
                <p className="text-[11px] opacity-70 mb-3 leading-tight">{project.desc}</p>
                <div className="text-[9px] font-bold text-retro-amber uppercase tracking-tighter">{project.tech}</div>
              </a>
            ))}
          </div>
        </div>
      </Window>

      <Window
        id="skills"
        title="Skills.exe"
        icon={<Code size={16} />}
        isOpen={windows.skills.isOpen}
        isMinimized={windows.skills.isMinimized}
        isMaximized={windows.skills.isMaximized}
        onClose={() => closeWindow('skills')}
        onMinimize={() => minimizeWindow('skills')}
        onMaximize={() => maximizeWindow('skills')}
        zIndex={20 + windowOrder.indexOf('skills')}
        onFocus={() => bringToFront('skills')}
        position={windows.skills.position}
        onPositionChange={(position) => updateWindowPosition('skills', position)}
        desktopRef={desktopRef}
        isDesktop={isDesktop}
        supportsWindowChrome={supportsWindowChrome}
      >
        <SkillsTerminal isOpen={windows.skills.isOpen} />
      </Window>

      <Window
        id="contact"
        title="Contact.sh"
        icon={<Mail size={16} />}
        isOpen={windows.contact.isOpen}
        isMinimized={windows.contact.isMinimized}
        isMaximized={windows.contact.isMaximized}
        onClose={() => closeWindow('contact')}
        onMinimize={() => minimizeWindow('contact')}
        onMaximize={() => maximizeWindow('contact')}
        zIndex={20 + windowOrder.indexOf('contact')}
        onFocus={() => bringToFront('contact')}
        position={windows.contact.position}
        onPositionChange={(position) => updateWindowPosition('contact', position)}
        desktopRef={desktopRef}
        isDesktop={isDesktop}
        supportsWindowChrome={supportsWindowChrome}
        maxWidth="32rem"
      >
        <div className="flex flex-col gap-3 md:gap-4">
          {contactStatus === 'success' ? (
            <div className="min-h-[340px] md:min-h-[420px] flex flex-col items-center justify-center text-center gap-5 border border-retro-green/30 bg-retro-green/5 p-5 md:p-8">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-retro-green bg-black/40 text-retro-green shadow-[0_0_30px_rgba(51,255,51,0.28)]">
                <Mail size={30} />
                <span className="absolute inset-0 rounded-full border border-retro-green/50 animate-ping" />
              </div>
              <div className="space-y-2">
                <div className="text-[10px] uppercase tracking-[0.35em] text-retro-amber">Transmission Delivered</div>
                <h3 className="text-xl md:text-2xl font-black text-retro-green">Message sent</h3>
                <p className="text-[11px] md:text-sm opacity-80 max-w-md">
                  Your message has been delivered to <span className="text-retro-green">samuelaroundtheworld@gmail.com</span>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setContactStatus('idle');
                  setContactError(null);
                }}
                onPointerDownCapture={(event) => event.stopPropagation()}
                className="w-full md:w-auto px-5 py-2 bg-white/10 border border-white/10 text-white font-bold hover:bg-white/15 transition-colors uppercase tracking-[0.2em] text-[10px] md:text-xs"
              >
                New Transmission
              </button>
            </div>
          ) : (
            <>
              <p className="text-[10px] md:text-sm opacity-80 shrink-0">
                Open to senior production leadership and product delivery opportunities.
              </p>

              <div className="space-y-2">
                <label className="block text-[8px] uppercase opacity-40 font-bold tracking-widest">Transmission</label>
                <textarea
                  value={contactMessage}
                  onChange={(event) => setContactMessage(event.target.value)}
                  placeholder="Type your message here..."
                  onPointerDownCapture={(event) => event.stopPropagation()}
                  className="w-full min-h-36 md:min-h-28 resize-none rounded-sm border border-white/10 bg-black/40 px-3 py-3 font-mono text-sm md:text-sm text-retro-green placeholder:text-white/25 outline-none transition-colors focus:border-retro-green/50 focus:bg-black/55"
                />
                {contactError ? (
                  <p className="text-[10px] md:text-xs text-red-400 uppercase tracking-[0.2em]">{contactError}</p>
                ) : null}
              </div>

              <div className="grid grid-cols-1 gap-2 content-start">
                <a
                  href="mailto:samuelaroundtheworld@gmail.com"
                  onPointerDownCapture={(event) => event.stopPropagation()}
                  className="flex items-center gap-2 md:gap-3 min-h-16 p-3 md:p-3 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer rounded-sm group min-w-0"
                >
                  <Mail size={16} className="text-red-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col min-w-0 overflow-hidden">
                    <span className="text-[8px] uppercase opacity-40 font-bold tracking-widest">Email</span>
                    <span className="text-[9px] md:text-sm truncate font-mono text-retro-green">samuelaroundtheworld@gmail.com</span>
                  </div>
                </a>

                <a
                  href={githubProfileUrl}
                  target="_blank"
                  rel="noreferrer"
                  onPointerDownCapture={(event) => event.stopPropagation()}
                  className="flex items-center gap-2 md:gap-3 min-h-16 p-3 md:p-3 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer rounded-sm group min-w-0"
                >
                  <Code size={16} className="text-red-500 shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="flex flex-col min-w-0 overflow-hidden">
                    <span className="text-[8px] uppercase opacity-40 font-bold tracking-widest">Github</span>
                    <span className="text-[9px] md:text-sm truncate font-mono text-retro-green">github.com/sammythaitiger</span>
                  </div>
                </a>
              </div>

              <div className="pt-2 shrink-0">
                <button
                  type="button"
                  onClick={sendContactTransmission}
                  disabled={contactStatus === 'sending'}
                  onPointerDownCapture={(event) => event.stopPropagation()}
                  className="w-full py-2 bg-red-600 text-white font-bold hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70 transition-colors uppercase tracking-[0.2em] text-[10px] md:text-xs shadow-[0_0_15px_rgba(220,38,38,0.3)]"
                >
                  {contactStatus === 'sending' ? 'TRANSMITTING...' : 'SEND_TRANSMISSION'}
                </button>
              </div>
            </>
          )}
        </div>
      </Window>

      {/* Taskbar */}
      <div className="fixed md:absolute bottom-0 left-0 right-0 h-10 bg-[#1a1a1a] border-t-2 border-[#333] flex items-center px-2 md:px-4 justify-between z-[60]">
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
          <div className="px-2 md:px-3 py-1 bg-retro-green text-black font-bold text-[10px] md:text-xs cursor-pointer hover:bg-white transition-colors shrink-0">
            START
          </div>
          <div className="flex gap-1 md:gap-2 overflow-x-auto no-scrollbar">
            {icons
              .map((item) => item.id)
              .filter((id) => windows[id].isOpen)
              .map((id) => (
              <div 
                key={id} 
                onClick={() => restoreWindow(id)}
                className={cn(
                  "px-2 md:px-3 py-1 text-[9px] md:text-[10px] font-mono border border-[#333] cursor-pointer transition-colors whitespace-nowrap",
                  activeWindow === id && !windows[id].isMinimized
                    ? "bg-[#333] text-retro-green"
                    : windows[id].isMinimized
                      ? "bg-[#111] text-white/60 hover:bg-[#222]"
                      : "hover:bg-[#222]"
                )}
              >
                {icons.find(i => i.id === id)?.title.split('.')[0]}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-3 shrink-0 ml-2">
          <button
            onClick={() => setSoundEnabled(v => !v)}
            title={soundEnabled ? 'Sound: ON' : 'Sound: OFF'}
            className={cn(
              'p-1 rounded-sm transition-colors',
              soundEnabled ? 'text-retro-green' : 'text-white/25 hover:text-white/60'
            )}
          >
            {soundEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
          </button>
          <div
            onClick={() => setClippyVisible(!clippyVisible)}
            className="text-[9px] md:text-[10px] font-mono opacity-50 cursor-pointer hover:opacity-100 transition-opacity"
          >
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-5xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src={selectedImage} 
                alt="Enlarged view" 
                className="max-w-full max-h-[90vh] object-contain border-2 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.5)]"
                referrerPolicy="no-referrer"
              />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-10 right-0 text-white hover:text-red-500 transition-colors flex items-center gap-2 uppercase tracking-widest text-xs font-bold"
              >
                CLOSE_VIEW <X size={20} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
