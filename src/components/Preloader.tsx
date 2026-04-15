import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';

interface PreloaderProps {
  onComplete: () => void;
}

const BOOT_LOGS = [
  "SAMMY OS v. 69.0.0 (build 420)",
  "Copyright (C) 1984-2026 Sammy Industries.",
  "",
  "CPU: Sammy-Core X1 @ 4.20GHz",
  "Memory: 640KB (Enough for anyone)",
  "Storage: 40MB Winchester Drive",
  "",
  "Checking system integrity...",
  "Kernel loaded at 0x00000000",
  "Initializing graphics driver: CRT-VGA v1.2",
  "Loading user profile: SAMMY_DEV",
  "Establishing secure connection to the matrix...",
  "Success.",
  "",
  "BOOTING...",
];

export const Preloader: React.FC<PreloaderProps> = ({ onComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isBooted, setIsBooted] = useState(false);
  const [showTVOff, setShowTVOff] = useState(false);

  useEffect(() => {
    let currentLog = 0;
    const interval = setInterval(() => {
      if (currentLog < BOOT_LOGS.length) {
        setLogs(prev => [...prev, BOOT_LOGS[currentLog]]);
        currentLog++;
      } else {
        clearInterval(interval);
        setTimeout(() => setIsBooted(true), 1000);
      }
    }, 150);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isBooted) {
      const timer = setTimeout(() => {
        setShowTVOff(true);
        setTimeout(onComplete, 800);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isBooted, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
      {/* Terminal Screen */}
      <div className="w-full max-w-2xl p-8 font-mono text-retro-green text-sm md:text-base leading-relaxed">
        <AnimatePresence mode="popLayout">
          {!showTVOff && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ 
                scaleY: 0.005, 
                scaleX: 1.2,
                opacity: 0,
                transition: { duration: 0.4, ease: "easeInOut" }
              }}
              className="relative"
            >
              {logs.map((log, i) => (
                <div key={i} className="mb-1">
                  {log === "" ? <br /> : <span>{log}</span>}
                </div>
              ))}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
                className="inline-block w-2 h-4 bg-retro-green ml-1 align-middle"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* TV Off Flash Effect */}
      <AnimatePresence>
        {showTVOff && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[110] bg-white"
            transition={{ duration: 0.1 }}
          >
            <motion.div
              initial={{ scaleY: 1 }}
              animate={{ scaleY: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="absolute inset-0 bg-black origin-center"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* CRT Overlay */}
      <div className="crt-overlay" />
    </div>
  );
};
