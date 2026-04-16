import React from 'react';
import { Dumbbell, LayoutDashboard, History as HistoryIcon, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { theme } from '../utils/theme';

export const Navbar = ({ activeTab, setActiveTab, onOpenProfile }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return null;

  const tabs = [
    { id: 'dashboard', icon: Dumbbell, label: 'Planos' },
    { id: 'generator', icon: LayoutDashboard, label: 'Auto-Treino' },
    { id: 'history', icon: HistoryIcon, label: 'Histórico' },
  ];

  // Componente interno para evitar repetição do bloco da logo + status
  const BrandBlock = ({ isMobile = false }) => (
    <div className="flex items-center relative">
      <img
        src="/images/superfrango.png"
        alt="Logo"
        className="absolute pointer-events-none object-contain"
        style={{
          width: isMobile ? '130px' : '110px',
          height: isMobile ? '130px' : '110px',
          left: isMobile ? '-55px' : '-45px',
          top: '50%',
          transform: 'translateY(-50%)',
          filter: 'invert(52%) sepia(91%) saturate(3029%) hue-rotate(360deg) brightness(101%) contrast(106%)',
          maxWidth: 'none'
        }}
      />
      <div className={`flex flex-col ${isMobile ? 'pl-11' : 'pl-10'}`}>
        <span className={`${isMobile ? 'text-[26px]' : 'text-[22px]'} font-black leading-none tracking-tighter text-white italic uppercase -ml-[5px]`}>
          SUPER <span className={theme.colors.primary}>FRANGO</span>
        </span>
        <div className="flex items-center gap-1.5 mt-0.5">
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-800 animate-pulse shadow-[0_0_5px_#22c55e]"></span>
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
              STATUS: ONLINE
            </span>
          </div>
          <span className="text-gray-600 text-[10px]">-</span>
          <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">
            {new Date().toLocaleDateString('pt-BR')}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Topo Mobile */}
      <div className="fixed top-0 left-0 right-0 z-50 flex md:hidden items-center justify-between px-4 h-16 bg-black/50 backdrop-blur-md border-b border-white/0.5">
        <BrandBlock isMobile={true} />
        <button onClick={onOpenProfile} className="w-10 h-10 rounded-full bg-[#111111] border border-white/10 overflow-hidden shadow-lg">
          {user?.profileImg ? (
            <img src={user.profileImg} className="w-full h-full object-cover" />
          ) : (
            <UserIcon size={20} className="mx-auto text-gray-500" />
          )}
        </button>
      </div>

      {/* Menu Inferior Mobile */}
      <nav className={`fixed bottom-0 left-0 right-0 ${theme.colors.surfaceLight} border-t ${theme.colors.border} px-6 py-3 z-50 md:hidden shadow-2xl`}>
        <div className="flex justify-around items-center">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? `${theme.colors.primary} scale-110` : 'text-gray-500'}`}
              >
                <Icon size={22} />
                <span className="text-[9px] font-bold uppercase tracking-widest">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Navbar Desktop - Padronizada com o estilo Mobile */}
      <nav className={`hidden md:flex fixed top-0 left-0 right-0 ${theme.colors.surfaceLight} border-b ${theme.colors.border} px-8 h-20 z-50 shadow-2xl items-center justify-between`}>
        <BrandBlock isMobile={false} />

        <div className="flex gap-10">
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

        <button onClick={onOpenProfile} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 group-hover:border-[#ff6600]/50 transition-all overflow-hidden">
            {user?.profileImg ? (
              <img src={user.profileImg} className="w-full h-full object-cover" />
            ) : (
              <UserIcon size={18} className="m-auto h-full text-gray-500" />
            )}
          </div>
        </button>
      </nav>
    </>
  );
};