// imports os componentes e dependências necessários para criar o wrapper de autenticação, incluindo o React, um ícone de seta para voltar, o componente de mensagem de status e o tema personalizado
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { StatusMessage } from './StatusMessage';
import { theme } from '../utils/theme';

// Componente de wrapper de autenticação que envolve as telas de login e registro, fornecendo uma estrutura consistente, mensagens de status e um botão para voltar
export const AuthWrapper = ({
  title,
  subtitle,
  children,
  onSubmit,
  onBack,
  uiMessage,
  loading,
}) => (
  <div className={`min-h-screen ${theme.colors.background} flex items-center justify-center p-6`}>
    <div
      className={`p-8 rounded-[2rem] ${theme.colors.surfaceLight} border ${theme.colors.border} w-full max-w-md space-y-8 shadow-2xl relative overflow-hidden`}
    >
      <button
        onClick={onBack}
        className="absolute top-6 left-6 text-gray-600 hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
      </button>
      <div className="text-center space-y-2 pt-4">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">
          {title}
        </h2>
        <p className="text-gray-500 text-sm font-medium">{subtitle}</p>
      </div>

      <StatusMessage type={uiMessage.type} message={uiMessage.text} />

      <form onSubmit={onSubmit} className="space-y-5">
        {children}
        {loading && (
          <div className="text-center text-[10px] text-[#ff6600] animate-pulse uppercase font-black tracking-widest">
            Sincronizando...
          </div>
        )}
      </form>
    </div>
  </div>
);
