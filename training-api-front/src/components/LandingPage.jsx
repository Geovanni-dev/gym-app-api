// Componente de página de destino que apresenta uma imagem de fundo, um título chamativo e botões para iniciar a jornada de registro ou entrar na conta, utilizando o tema personalizado para cores e estilos
import React from 'react';
import { Zap, UserPlus, LogIn } from 'lucide-react';
import { theme } from '../utils/theme';

// Componente de página de destino
export const LandingPage = ({ onStart }) => (
  <div
    className={`min-h-screen ${theme.colors.background} text-white relative flex flex-col items-center justify-center overflow-hidden`}
  >
    <div
      className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60 scale-105 transition-transform duration-[10s] hover:scale-110"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')`,
      }}
    />
    <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/80 to-transparent" />

    <div className="z-20 text-center px-6 max-w-4xl space-y-12">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Zap className={theme.colors.primary} fill="currentColor" size={32} />
        <span className="font-black text-3xl tracking-tighter italic uppercase">
          IRON <span className={theme.colors.primary}>& SOUL</span>
        </span>
      </div>

      <h1 className="text-6xl md:text-[9rem] font-black italic tracking-tighter leading-[0.85] uppercase animate-in slide-in-from-bottom duration-700">
        ONDE O <span className={theme.colors.primary}>BACKEND</span>
        <br />
        VIRA MÚSCULO.
      </h1>

      <div className="flex flex-col md:flex-row items-center justify-center gap-5 pt-6">
        <button
          onClick={() => onStart('register')}
          className={`group w-full md:w-auto py-5 px-10 rounded-xl font-black italic text-black transition-all flex items-center justify-center gap-3 ${theme.colors.primaryBg} ${theme.colors.primaryHover} shadow-[0_0_40px_rgba(255,102,0,0.35)] active:scale-95`}
        >
          INICIAR JORNADA{' '}
          <UserPlus size={22} className="group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          onClick={() => onStart('login')}
          className="w-full md:w-auto py-5 px-10 rounded-xl font-black italic text-white border-2 border-white/10 hover:bg-white/5 hover:border-white/40 transition-all flex items-center justify-center gap-3 active:scale-95 bg-black/20 backdrop-blur-md"
        >
          ENTRAR NA CONTA <LogIn size={22} />
        </button>
      </div>
    </div>
  </div>
);
