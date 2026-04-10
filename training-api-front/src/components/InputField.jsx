// Componente de campo de entrada personalizado com suporte para ícones, mensagens de erro e toggle de visibilidade para campos de senha
import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

// Componente de campo de entrada personalizado com suporte para ícones, mensagens de erro e toggle de visibilidade para campos de senha
export const InputField = React.forwardRef(
  ({ label, icon: Icon, error, type = 'text', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';

    return (
      // Estrutura do componente de campo de entrada, incluindo o rótulo, o campo de entrada e a mensagem de erro
      <div className="space-y-1.5 w-full text-left">
        <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1 flex items-center gap-2">
          {Icon && <Icon size={12} />} {label}
        </label>
        <div className="relative">
          <input
            {...props}
            ref={ref}
            type={isPassword ? (showPassword ? 'text' : 'password') : type}
            className={`w-full bg-black/50 border ${error ? 'border-red-500' : 'border-white/10'} rounded-xl p-4 pr-12 text-white focus:border-[#ff6600] outline-none transition-all placeholder:text-gray-800 no-spinners`}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#ff6600] transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}
        </div>
        {error && (
          <span className="text-[10px] font-bold text-red-500 ml-1 uppercase">{error}</span>
        )}
      </div>
    );
  }
);
