import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Folder, User, Code, Mail, X, Minus, Square } from 'lucide-react';
import { cn } from '@/src/lib/utils';

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
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  zIndex: number;
  onFocus: () => void;
  maxWidth?: string;
}

const Window: React.FC<WindowProps> = ({ title, icon, isOpen, onClose, children, zIndex, onFocus, maxWidth = "max-w-4xl" }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          style={{ zIndex }}
          onMouseDown={onFocus}
          className={cn(
            "absolute inset-0 md:inset-auto md:top-[48%] md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[92%] md:h-auto md:max-h-[85%] bg-[#1a1a1a] border-0 md:border-2 border-[#333] shadow-2xl flex flex-col md:rounded-sm overflow-hidden z-40",
            maxWidth
          )}
        >
          {/* Title Bar */}
          <div className="bg-[#222] md:bg-[#333] p-3 md:p-2 flex items-center justify-between select-none border-b border-[#333] shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-retro-green">{icon}</span>
              <span className="text-[10px] md:text-xs font-mono font-bold uppercase tracking-wider truncate max-w-[150px] md:max-w-none">{title}</span>
            </div>
            <div className="flex gap-3 md:gap-2">
              <button className="hidden md:block hover:bg-[#444] p-1 rounded-sm transition-colors">
                <Minus size={14} />
              </button>
              <button className="hidden md:block hover:bg-[#444] p-1 rounded-sm transition-colors">
                <Square size={14} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onClose(); }}
                className="hover:bg-red-500 p-1.5 md:p-1 rounded-sm transition-colors"
              >
                <X size={18} className="md:w-3.5 md:h-3.5" />
              </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1 overflow-auto p-4 md:p-6 font-mono text-xs md:text-sm leading-relaxed custom-scrollbar pb-20 md:pb-6">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const GlitchText: React.FC = () => {
  return (
    <div className="relative pointer-events-none select-none flex flex-col items-center justify-center w-full max-w-full px-4 text-center">
      <div className="relative w-full flex justify-center">
        {/* Main Text with stronger glow */}
        <div className="text-4xl sm:text-5xl md:text-8xl font-black text-red-500/50 tracking-tighter uppercase relative z-10 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)] break-words w-full">
          Samir Akhmedoff
        </div>
        
        {/* Glitch layers */}
        <motion.div
          animate={{
            opacity: [0, 0, 0.7, 0, 0.9, 0, 0],
            x: [0, -8, 8, -4, 0, 4, 0],
            skewX: [0, 15, -15, 0, 8, 0, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            times: [0, 0.1, 0.12, 0.14, 0.16, 0.18, 1],
          }}
          className="absolute inset-0 text-4xl sm:text-5xl md:text-8xl font-black text-red-400 tracking-tighter uppercase blur-[0.5px] z-0 flex justify-center w-full"
        >
          Samir Akhmedoff
        </motion.div>
        
        <motion.div
          animate={{
            opacity: [0, 0.6, 0, 0.8, 0, 0],
            x: [0, 8, -8, 4, 0, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            times: [0, 0.2, 0.22, 0.24, 0.26, 1],
            delay: 1
          }}
          className="absolute inset-0 text-4xl sm:text-5xl md:text-8xl font-black text-blue-400 tracking-tighter uppercase blur-[0.5px] z-0 flex justify-center w-full"
        >
          Samir Akhmedoff
        </motion.div>
      </div>
      
      <motion.div 
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="text-sm sm:text-base md:text-2xl font-mono text-red-500/60 mt-2 md:mt-4 tracking-[0.1em] sm:tracking-[0.2em] md:tracking-[0.6em] uppercase drop-shadow-[0_0_10px_rgba(239,68,68,0.3)]"
      >
        Web - Developer
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

export const Desktop: React.FC = () => {
  const [openWindows, setOpenWindows] = useState<string[]>([]);
  const [activeWindow, setActiveWindow] = useState<string | null>(null);
  const [clippyVisible, setClippyVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const toggleWindow = (id: string) => {
    if (openWindows.includes(id)) {
      setActiveWindow(id);
    } else {
      setOpenWindows([...openWindows, id]);
      setActiveWindow(id);
    }
  };

  const closeWindow = (id: string) => {
    setOpenWindows(openWindows.filter(w => w !== id));
    if (activeWindow === id) setActiveWindow(null);
  };

  const icons = [
    { id: 'about', title: 'About_Me.txt', icon: <User size={32} />, color: 'text-blue-400' },
    { id: 'projects', title: 'Projects', icon: <Folder size={32} />, color: 'text-yellow-400' },
    { id: 'skills', title: 'Skills.exe', icon: <Code size={32} />, color: 'text-green-400' },
    { id: 'contact', title: 'Contact.sh', icon: <Mail size={32} />, color: 'text-purple-400' },
  ];

  return (
    <div className="relative w-full h-full p-6 select-none overflow-hidden min-h-full">
      <MatrixBackground />
      
      {/* Glitch Text Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-full flex justify-center items-center">
        <GlitchText />
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
        title="About_Me.txt"
        icon={<User size={16} />}
        isOpen={openWindows.includes('about')}
        onClose={() => closeWindow('about')}
        zIndex={activeWindow === 'about' ? 50 : 10}
        onFocus={() => setActiveWindow('about')}
      >
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Stylized Photo */}
            <motion.div 
              initial={{ opacity: 0, x: -50, rotateY: 90 }}
              animate={{ opacity: 1, x: 0, rotateY: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className="relative w-full md:w-64 aspect-square shrink-0 group"
            >
              <div className="absolute inset-0 bg-red-600/20 blur-xl group-hover:bg-red-600/40 transition-colors duration-500" />
              <div className="relative w-full h-full border-2 border-red-600 overflow-hidden bg-[#111] grayscale contrast-125 brightness-90 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700">
                <img 
                  src="https://storage.googleapis.com/m-infra.appspot.com/public/res/ais/vh6x36qnstd5nmilecdeac/input_file_3.png" 
                  alt="Samir Akhmedoff" 
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('input_file_0')) {
                      target.src = 'https://storage.googleapis.com/m-infra.appspot.com/public/res/ais/vh6x36qnstd5nmilecdeac/input_file_0.png';
                    } else if (!target.src.includes('picsum')) {
                      target.src = 'https://picsum.photos/seed/samir_dev/600/600';
                    }
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-red-600/20 to-transparent opacity-50" />
                <div className="absolute top-0 left-0 w-full h-1 bg-red-600/50 animate-[scanline_4s_linear_infinite]" />
              </div>
              <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-red-500" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-red-500" />
            </motion.div>

          <div className="space-y-4 flex-1">
            <h2 className="text-xl md:text-2xl text-red-500 border-b border-red-900/30 pb-2 flex items-center gap-2 font-black">
              <span className="animate-pulse">●</span> SYSTEM_ARCHITECT: SAMIR_AKHMEDOFF
            </h2>
            <div className="space-y-4 text-sm md:text-base leading-relaxed">
              <p className="text-retro-green font-bold text-lg md:text-xl tracking-tight">
                Digital Architect & Production Strategist.
              </p>
              <p className="text-retro-green/90">
                A seasoned architect with a decade-long track record in production management and 
                high-stakes engineering. I specialize in designing robust, scalable ecosystems and 
                leading in-house development teams to deliver complex products from inception to global launch.
              </p>
              <div className="space-y-3 border-l-2 border-red-600/50 pl-4 py-1 bg-red-600/5">
                <div>
                  <span className="text-red-500 font-black uppercase text-[10px] tracking-[0.2em] block mb-1">Core_Architecture:</span>
                  <p className="text-xs md:text-sm"><span className="text-white font-bold">Thai Tone Lab</span> — Full-cycle architectural design and development. Built with <span className="text-retro-amber">Expo, React Native, React Native Paper</span> and a <span className="text-retro-amber">Python-driven backend</span> for advanced tonal analysis.</p>
                </div>
                <div>
                  <span className="text-red-500 font-black uppercase text-[10px] tracking-[0.2em] block mb-1">Infrastructure_Legacy:</span>
                  <p className="text-xs md:text-sm"><span className="text-white font-bold">Free-Torrents.org</span> — Architected and deployed a massive-scale community platform. Customized <span className="text-retro-amber">phpBB engine</span> and engineered server-side torrent infrastructure.</p>
                </div>
                <div>
                  <span className="text-red-500 font-black uppercase text-[10px] tracking-[0.2em] block mb-1">Methodology:</span>
                  <p className="text-xs md:text-sm">Integrating <span className="text-white font-bold">AI-Augmented Architecture</span> to accelerate production cycles while maintaining enterprise-grade stability.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] md:text-xs pt-2">
                <div className="p-3 border border-retro-green/20 bg-retro-green/5 flex flex-col justify-center">
                  <span className="text-retro-amber block mb-1 uppercase tracking-widest font-bold">Versatility:</span>
                  Management + Engineering
                </div>
                <div className="p-3 border border-red-900/20 bg-red-900/5 flex flex-col justify-center">
                  <span className="text-red-500 block mb-1 uppercase tracking-widest font-bold">Reliability:</span>
                  100% Delivery Rate
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
            <h3 className="text-retro-amber border-b border-retro-amber/30 pb-1 uppercase tracking-widest">Experience_Log:</h3>
            
            {/* VMLY&R */}
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="text-retro-green font-bold">VMLY&R (MA) · Digital Production Manager</h4>
                <span className="text-[10px] opacity-50">Aug 2021 – Apr 2023</span>
              </div>
              <p className="text-xs opacity-80 italic">American communication group (Russia operations until 2023)</p>
              <div className="pl-4 border-l border-retro-green/30 space-y-3 mt-2">
                <div>
                  <p className="text-xs font-bold text-retro-amber underline">British American Tobacco (Lucky Strike):</p>
                  <ul className="text-[11px] list-disc list-inside opacity-70 mt-1">
                    <li>Managed cross-functional team (Art, Creative, Dev, Account) for Luckystrike.ru portal launch.</li>
                    <li>Executed promotional activities and special projects using SCRUM/Kanban.</li>
                    <li>Developed custom digital assets and sticker packs.</li>
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold text-retro-amber underline">Aperol Spritz:</p>
                  <ul className="text-[11px] list-disc list-inside opacity-70 mt-1">
                    <li>Launched MS Dynamics in Russia (152-FZ compliance).</li>
                    <li>Integrated chatbots with QR codes and receipt promotions.</li>
                    <li>Managed off-trade/on-trade campaigns with artist Leshay Svik.</li>
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
                <p className="text-[11px] opacity-70">
                  Managed the entire digital production department for pharmaceutical market clients.
                </p>
                <ul className="text-[11px] list-disc list-inside opacity-70">
                  <li>Resource management: designers, web developers, and creative teams.</li>
                  <li>Contractor selection, negotiation, and legal/media buying coordination.</li>
                  <li>End-to-end delivery of websites, landing pages, banners, and video assets.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Window>

      <Window
        title="Projects"
        icon={<Folder size={16} />}
        isOpen={openWindows.includes('projects')}
        onClose={() => closeWindow('projects')}
        zIndex={activeWindow === 'projects' ? 50 : 10}
        onFocus={() => setActiveWindow('projects')}
      >
        <div className="space-y-8">
          {/* Lucky Strike Special Section */}
          <div className="border-2 border-red-600 p-4 bg-red-600/5">
            <h3 className="text-red-500 font-black uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="animate-ping w-2 h-2 bg-red-500 rounded-full" />
              Featured_Project: Lucky Strike (BAT)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {[
                "https://storage.googleapis.com/m-infra.appspot.com/public/res/ais/vh6x36qnstd5nmilecdeac/input_file_4.png",
                "https://storage.googleapis.com/m-infra.appspot.com/public/res/ais/vh6x36qnstd5nmilecdeac/input_file_5.png",
                "https://storage.googleapis.com/m-infra.appspot.com/public/res/ais/vh6x36qnstd5nmilecdeac/input_file_6.png"
              ].map((src, i) => (
                <div 
                  key={i} 
                  className="aspect-[9/19] border border-red-900/30 overflow-hidden group relative cursor-zoom-in"
                  onClick={() => setSelectedImage(src)}
                >
                  <img 
                    src={src} 
                    alt={`Lucky Strike ${i+1}`} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('picsum')) {
                        target.src = `https://picsum.photos/seed/lucky_${i}/600/1200`;
                      }
                    }}
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
                desc: 'Full-cycle mobile development for tonal analysis. Developed entirely by me.', 
                tech: 'Expo, React Native, RN Paper, Python',
              },
              { 
                name: 'Free-Torrents.org', 
                desc: 'Legendary torrent community. Customized phpBB & server-side torrent systems.', 
                tech: 'phpBB, Infrastructure, Server-Side',
                link: 'https://ru.wikipedia.org/wiki/Free-Torrents.org'
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
              <div key={i} className="border border-[#333] p-4 hover:border-red-600 transition-colors group cursor-pointer bg-black/20">
                <h3 className="text-retro-green mb-1 group-hover:text-red-500 transition-colors flex justify-between items-center">
                  {project.name}
                  {project.link && <span className="text-[8px] border border-red-900 px-1 text-red-900">WIKI</span>}
                </h3>
                <p className="text-[11px] opacity-70 mb-3 leading-tight">{project.desc}</p>
                <div className="text-[9px] font-bold text-retro-amber uppercase tracking-tighter">{project.tech}</div>
              </div>
            ))}
          </div>
        </div>
      </Window>

      <Window
        title="Skills.exe"
        icon={<Code size={16} />}
        isOpen={openWindows.includes('skills')}
        onClose={() => closeWindow('skills')}
        zIndex={activeWindow === 'skills' ? 50 : 10}
        onFocus={() => setActiveWindow('skills')}
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-retro-amber mb-3">MANAGEMENT_&_PRODUCTION:</h3>
            <div className="p-3 border border-retro-green/30 bg-retro-green/5 rounded-sm mb-4">
              <p className="text-retro-green font-bold mb-1">PRODUCTION_MANAGER_EXPERIENCE</p>
              <p className="text-xs opacity-80">
                Extensive experience in production management, overseeing full-cycle development processes, 
                resource allocation, and high-stakes delivery pipelines.
              </p>
            </div>
          </div>
          <div>
            <h3 className="text-retro-amber mb-3">FRONTEND_STACK:</h3>
            <div className="flex flex-wrap gap-2">
              {['React', 'TypeScript', 'Tailwind', 'Motion', 'Three.js', 'Next.js'].map(s => (
                <span key={s} className="px-2 py-1 bg-retro-green/10 border border-retro-green/30 text-retro-green text-[10px]">{s}</span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-retro-amber mb-3">BACKEND_STACK:</h3>
            <div className="flex flex-wrap gap-2">
              {['Node.js', 'Express', 'PostgreSQL', 'Redis', 'Docker', 'GraphQL'].map(s => (
                <span key={s} className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px]">{s}</span>
              ))}
            </div>
          </div>
          <div className="p-4 bg-black/50 border border-dashed border-[#333]">
            <p className="text-[10px] opacity-50 italic">
              "The only limit is the size of your swap file."
            </p>
          </div>
        </div>
      </Window>

      <Window
        title="Contact.sh"
        icon={<Mail size={16} />}
        isOpen={openWindows.includes('contact')}
        onClose={() => closeWindow('contact')}
        zIndex={activeWindow === 'contact' ? 50 : 10}
        onFocus={() => setActiveWindow('contact')}
        maxWidth="md:max-w-md"
      >
        <div className="flex flex-col h-full gap-2 md:gap-4">
          <p className="text-[10px] md:text-sm opacity-80 shrink-0">Ready to build something legendary?</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer rounded-sm group min-w-0">
              <Mail size={16} className="text-red-500 shrink-0 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col min-w-0 overflow-hidden">
                <span className="text-[8px] uppercase opacity-40 font-bold tracking-widest">Email</span>
                <span className="text-[9px] md:text-sm truncate font-mono text-retro-green">samir.akhmedoff@gmail.com</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3 p-2 md:p-3 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer rounded-sm group min-w-0">
              <Code size={16} className="text-red-500 shrink-0 group-hover:scale-110 transition-transform" />
              <div className="flex flex-col min-w-0 overflow-hidden">
                <span className="text-[8px] uppercase opacity-40 font-bold tracking-widest">Github</span>
                <span className="text-[9px] md:text-sm truncate font-mono text-retro-green">github.com/samir-dev</span>
              </div>
            </div>
          </div>

          <div className="pt-2 shrink-0">
            <button className="w-full py-2 bg-red-600 text-white font-bold hover:bg-red-500 transition-colors uppercase tracking-[0.2em] text-[10px] md:text-xs shadow-[0_0_15px_rgba(220,38,38,0.3)]">
              SEND_TRANSMISSION
            </button>
          </div>
        </div>
      </Window>

      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 right-0 h-10 bg-[#1a1a1a] border-t-2 border-[#333] flex items-center px-2 md:px-4 justify-between z-[60]">
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
          <div className="px-2 md:px-3 py-1 bg-retro-green text-black font-bold text-[10px] md:text-xs cursor-pointer hover:bg-white transition-colors shrink-0">
            START
          </div>
          <div className="flex gap-1 md:gap-2 overflow-x-auto no-scrollbar">
            {openWindows.map(id => (
              <div 
                key={id} 
                onClick={() => setActiveWindow(id)}
                className={cn(
                  "px-2 md:px-3 py-1 text-[9px] md:text-[10px] font-mono border border-[#333] cursor-pointer transition-colors whitespace-nowrap",
                  activeWindow === id ? "bg-[#333] text-retro-green" : "hover:bg-[#222]"
                )}
              >
                {icons.find(i => i.id === id)?.title.split('.')[0]}
              </div>
            ))}
          </div>
        </div>
        <div 
          onClick={() => setClippyVisible(!clippyVisible)}
          className="text-[9px] md:text-[10px] font-mono opacity-50 shrink-0 ml-2 cursor-pointer hover:opacity-100 transition-opacity"
        >
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
