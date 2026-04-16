import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  LogIn, 
  Flame, 
  ChevronRight
} from 'lucide-react';
import { theme } from '../utils/theme';

export const LandingPage = ({ onStart }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    
<div className={`fixed inset-0 w-full ${theme.colors.background} text-white flex flex-col items-center justify-between overflow-hidden font-sans p-6`}>
      
      {/* Background Camada */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div 
          className="absolute inset-0 bg-cover bg-[center_top] opacity-30 transition-transform duration-[20s] ease-out"
          style={{ 
            backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')`,
            transform: isLoaded ? 'scale(1.1)' : 'scale(1.3)'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-transparent" />
      </div>

      {/* Topo: Logo e Nome */}
      <header className={`z-20 flex flex-col items-center transition-all duration-700 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <img 
          src="/images/superfrango.png" 
          alt="Logo" 
          className="w-70 h-35 -mb-[30px] -ml-[20px] pointer-events-none" 
          style={{
            filter: `
      invert(52%) sepia(91%) saturate(3029%) hue-rotate(360deg) brightness(101%) contrast(106%)
      drop-shadow(0 0 5px rgba(255, 102, 0, 0.1))   /* Brilho interno/próximo */
      drop-shadow(0 0 15px rgba(255, 102, 0, 0.4))  /* Aura neon espalhada */
    `
  }}
        />
        <div className="flex flex-col items-center leading-[0.9] -mt-1">
          <span className="text-xl font-black italic tracking-tighter uppercase opacity-80">SUPER</span>
          <span className={`text-3xl font-black italic tracking-tighter uppercase ${theme.colors.primary} -mt-2`}>FRANGO</span>
        </div>
      </header>

      {/* Centro: O Grito de Guerra */}
      <main className="z-20 flex flex-col items-center text-center w-full">
        <div className={`transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full mb-4 backdrop-blur-md">
            <Flame size={12} className="text-orange-500" fill="currentColor" />
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400">Hardcore App</span>
          </div>

          <h1 className="text-6xl md:text-7xl lg:text-8xl font-black italic tracking-tighter leading-[0.85] uppercase">
            ONDE O <br />
            <span className={`${theme.colors.primary} filter drop-shadow-[0_0_20px_rgba(249,115,22,0.5)]`}>FRANGO</span>
            <br />
            VIRA MONSTRO
          </h1>
        </div>
      </main>

     {/* Baixo: Ações - Responsivo Desktop */}
<footer className={`z-20 w-full transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
  <div className="flex flex-col md:flex-row md:items-center md:justify-center md:gap-4 w-full items-center">
   <button
  onClick={() => onStart('register')}
  className={`group w-9/12 md:w-auto md:px-6 py-4 rounded-2xl font-black italic text-black transition-all flex items-center justify-center gap-2 ${theme.colors.primaryBg} ${theme.colors.primaryHover} shadow-[0_0_20px_rgba(255,102,0,0.9)] active:scale-95`}
>
  INICIAR JORNADA 
  <ChevronRight size={18} className="animate-pulse" />
</button>

    <button
      onClick={() => onStart('login')}
      className="w-9/12 md:w-auto md:px-6 py-4 rounded-2xl font-black italic text-white border-2 border-white/10 transition-all flex items-center justify-center gap-2 active:scale-95 hover:bg-white/5 mt-3 md:mt-0"
    >
      ENTRAR NA CONTA <LogIn size={18} className="opacity-60" />
    </button>
  </div>

  <p className="text-[10px] text-center text-neutral-600 font-bold uppercase tracking-widest mt-4">
    Treine como um monstro ou continue um frango.
  </p>
</footer>

    </div>
  );
};