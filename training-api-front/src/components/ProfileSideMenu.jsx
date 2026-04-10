import React, { useState } from 'react';
import {
  Zap,
  User as UserIcon,
  Camera,
  ShieldAlert,
  ChevronUp,
  ChevronDown,
  LogOut,
  X,
} from 'lucide-react';
import { theme } from '../utils/theme';

export const ProfileSideMenu = ({ isOpen, onClose, user, logout, securityContent }) => {
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-[340px] max-w-[90vw] ${theme.colors.surfaceLight} border-l ${theme.colors.border} z-[101] transform transition-transform duration-500 ease-out p-6 overflow-y-auto no-scrollbar ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <Zap className={theme.colors.primary} size={22} fill="currentColor" />
            <span className="text-white font-black italic uppercase tracking-tighter text-lg">
              Arena Profile
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col items-center text-center space-y-4 mb-8 pb-8 border-b border-white/5">
          <div className="relative group">
            <div
              className={`w-24 h-24 rounded-full ${theme.colors.primaryBg} flex items-center justify-center text-black shadow-[0_0_40px_rgba(255,102,0,0.15)]`}
            >
              <UserIcon size={48} strokeWidth={2.5} />
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-black border border-white/10 rounded-full text-[#ff6600] hover:scale-110 transition-all">
              <Camera size={14} />
            </button>
          </div>
          <div>
            <h3 className="text-xl font-black italic uppercase text-white leading-none tracking-tight">
              {user?.name}
            </h3>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div
            className={`border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 ${isSecurityOpen ? 'bg-white/[0.02]' : ''}`}
          >
            <button
              onClick={() => setIsSecurityOpen(!isSecurityOpen)}
              className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3 text-gray-400">
                <ShieldAlert
                  size={18}
                  className={isSecurityOpen ? theme.colors.primary : 'text-gray-500'}
                />
                <h4
                  className={`text-xs font-black uppercase tracking-widest transition-colors ${isSecurityOpen ? 'text-white' : ''}`}
                >
                  Segurança
                </h4>
              </div>
              {isSecurityOpen ? (
                <ChevronUp size={16} className="text-gray-600" />
              ) : (
                <ChevronDown size={16} className="text-gray-600" />
              )}
            </button>

            <div
              className={`transition-all duration-300 overflow-hidden ${isSecurityOpen ? 'max-h-[600px] opacity-100 p-5 pt-0' : 'max-h-0 opacity-0'}`}
            >
              {securityContent}
            </div>
          </div>

          <div className="pt-4 space-y-4">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] border border-red-500/10 hover:bg-red-500/10 transition-all active:scale-95 mt-4"
            >
              <LogOut size={16} /> Encerrar Sessão
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
