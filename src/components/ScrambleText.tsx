import React, { useEffect, useRef, useState } from 'react';

const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*<>/\\|{}[]';

interface ScrambleTextProps {
  text: string;
  duration?: number;
  trigger?: unknown;
  className?: string;
  onReveal?: () => void;
}

export const ScrambleText: React.FC<ScrambleTextProps> = ({
  text,
  duration = 900,
  trigger,
  className,
  onReveal,
}) => {
  const [display, setDisplay] = useState(text);
  const rafRef = useRef<number | null>(null);
  const prevRevealRef = useRef(0);
  const callCountRef = useRef(0);

  useEffect(() => {
    const start = performance.now();
    const chars = Array.from(text);
    prevRevealRef.current = 0;
    callCountRef.current = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const revealCount = Math.floor(progress * chars.length);

      if (onReveal && revealCount > prevRevealRef.current) {
        callCountRef.current += revealCount - prevRevealRef.current;
        if (callCountRef.current % 3 === 0) onReveal();
        prevRevealRef.current = revealCount;
      }

      const next = chars
        .map((ch, i) => {
          if (i < revealCount || ch === ' ' || ch === '_' || ch === ':') return ch;
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join('');

      setDisplay(next);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setDisplay(text);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [text, duration, trigger]);

  return <span className={className}>{display}</span>;
};
