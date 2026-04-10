import React from 'react'; // importa o React para criar o componente de mensagem de status
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export const StatusMessage = ({ type, message }) => {
  // componente de mensagem de status
  if (!message) return null;
  return (
    <div className="animate-in fade-in duration-300 mb-4">
      {' '}
      {/* Animação de fade-in para a mensagem */}
      <div
        className={`flex items-center gap-2 p-4 rounded-xl border ${type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-[#ff6600]/10 border-[#ff6600]/20 text-[#ff6600]'}`}
      >
        {type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
        <span className="text-xs font-bold uppercase tracking-wider">{message}</span>
      </div>
    </div>
  );
};
