import React from 'react';
import {
  Dumbbell,
  LayoutDashboard,
  History as HistoryIcon,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { theme } from '../utils/theme';

/**
 * Componente Navbar - Gerencia a navegação principal, 
 * exibição de logo e status do sistema.
 */
export const Navbar = ({ activeTab, setActiveTab, onOpenProfile }) => {
  const { isAuthenticated, user } = useAuth(); 

  // Bloqueio de renderização para usuários não autenticados
  if (!isAuthenticated) return null;

  // Configuração das abas de navegação
  const tabs = [
    { id: 'dashboard', icon: Dumbbell, label: 'Planos' },
    { id: 'generator', icon: LayoutDashboard, label: 'Auto-Treino' },
    { id: 'history', icon: HistoryIcon, label: 'Histórico' },
  ];

  return (
    <>
      {/* Header Mobile: Logo, Status Online e Perfil */}
      <div className="fixed top-0 left-0 right-0 z-50 flex md:hidden items-center justify-between px-4 py-3 bg-black/50 backdrop-blur-md border-b border-white/0.5">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <img 
              src="/images/super-frango.png" 
              alt="Logo" 
              className="w-7 h-7 object-contain -translate-y-[-1px] -ml-8px]"
              style={{
                filter: 'invert(52%) sepia(91%) saturate(3029%) hue-rotate(360deg) brightness(101%) contrast(106%)'
              }}
            />
            <span className="font-black text-xl tracking-tighter text-white italic uppercase">
              SUPER <span className={theme.colors.primary}> FRANGO</span>
            </span>
          </div>

          <div className="flex items-center gap- mt-">
            <div className="flex items-center gap-1.5 ml-6">
              <span className="w-1.5 h-1.5 rounded-full bg-green-800 animate-pulse shadow-[0_0_5px_#22c55e]"></span>
              <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
                STATUS: ONLINE
              </span>
            </div>
            <span className="text-[12px] font-bold text-gray-600 mx-2"> - </span>
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">
              {new Date().toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>

        <button
          onClick={onOpenProfile}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-[#111111] border border-white/10 text-gray-500 hover:text-[#ff6600] hover:border-[#ff6600]/50 transition-all overflow-hidden"
        >
          {/* Lógica da foto no Mobile */}
          {user?.profileImg ? (
            <img src={user.profileImg} alt="Perfil" className="w-10 h-10 rounded-full object-cover border-2 border-black/50 shadow-[0_0_10px_rgba(255,102,0,0.1)]" />
          ) : (
            <UserIcon size={20} />
          )}
        </button>
      </div>

      {/* Navbar Inferior: Apenas visualização Mobile */}
      <nav className={`fixed bottom-0 left-0 right-0 ${theme.colors.surfaceLight} border-t ${theme.colors.border} px-6 py-3 z-50 md:hidden shadow-2xl`}>
        <div className="flex justify-around items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? `${theme.colors.primary} scale-110` : 'text-gray-500 hover:text-white'}`}
              >
                <Icon size={22} />
                <span className="text-[9px] font-bold uppercase tracking-widest">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Navbar Superior: Apenas visualização Desktop */}
      <nav className={`hidden md:flex fixed top-0 left-0 right-0 ${theme.colors.surfaceLight} border-b ${theme.colors.border} px-8 py-4 z-50 shadow-2xl items-center justify-between`}>
        <div className="flex items-center gap-2">
          <img 
            src="/images/super-frango.png" 
            alt="Logo" 
            className="w-5 h-7 object-contain -translate-y-[-1px] -ml-[9px]"
            style={{
              filter: 'invert(52%) sepia(91%) saturate(3029%) hue-rotate(360deg) brightness(101%) contrast(106%)'
            }}
          />
          <span className="font-black text-xl tracking-tighter text-white italic uppercase">
            SUPER <span className={theme.colors.primary}> FRANGO</span>
          </span>
        </div>

        <div className="flex gap-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 transition-all ${activeTab === tab.id ? `${theme.colors.primary}` : 'text-gray-500 hover:text-white'}`}
              >
                <Icon size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={onOpenProfile}
          className="flex items-center gap-2 text-gray-500 hover:text-[#ff6600] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border border-white/10 hover:border-[#ff6600]/50 transition-all">
            {/* Lógica da foto no Desktop */}
            {user?.profileImg ? (
              <img src={user.profileImg} alt="Perfil" className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={18} />
            )}
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Perfil</span>
        </button>
      </nav>
    </>
  );
};