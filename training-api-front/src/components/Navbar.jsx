import React from 'react';
import {
  Dumbbell,
  LayoutDashboard,
  History as HistoryIcon,
  User as UserIcon,
  Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { theme } from '../utils/theme';

export const Navbar = ({ activeTab, setActiveTab, onOpenProfile }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;

  const tabs = [
    { id: 'dashboard', icon: Dumbbell, label: 'Planos' },
    { id: 'generator', icon: LayoutDashboard, label: 'Auto-Treino' },
    { id: 'history', icon: HistoryIcon, label: 'Histórico' },
  ];

  return (
    <>
      {/* Header superior mobile - com logo, status e perfil */}
      <div className="fixed top-0 left-0 right-0 z-50 flex md:hidden items-center justify-between px-4 py-5 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <Zap className={theme.colors.primary} fill="currentColor" size={20} />
            <span className="font-black text-xl tracking-tighter text-white italic uppercase">
              IRON<span className={theme.colors.primary}>& SOUL</span>
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              STATUS: PROTOCOLO ATIVO
            </span>
            <span className="text-[10px] font-bold text-gray-600">•</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
              {new Date().toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
        <button
          onClick={onOpenProfile}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-[#111111] border border-white/10 text-gray-500 hover:text-[#ff6600] hover:border-[#ff6600]/50 transition-all"
        >
          <UserIcon size={20} />
        </button>
      </div>

      {/* Navbar inferior - apenas no mobile */}
      <nav
        className={`fixed bottom-0 left-0 right-0 ${theme.colors.surfaceLight} border-t ${theme.colors.border} px-6 py-3 z-50 md:hidden shadow-2xl`}
      >
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

      {/* Navbar desktop - visível apenas no desktop */}
      <nav
        className={`hidden md:flex fixed top-0 left-0 right-0 ${theme.colors.surfaceLight} border-b ${theme.colors.border} px-8 py-4 z-50 shadow-2xl items-center justify-between`}
      >
        <div className="flex items-center gap-2">
          <Zap className={theme.colors.primary} fill="currentColor" size={24} />
          <span className="font-black text-xl tracking-tighter text-white italic uppercase">
            IRON<span className={theme.colors.primary}>& SOUL</span>
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
            <UserIcon size={18} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest">Perfil</span>
        </button>
      </nav>
    </>
  );
};
