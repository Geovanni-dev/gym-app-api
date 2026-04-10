// src/hooks/useScrollToInput.js
import { useEffect } from 'react';

export const useScrollToInput = () => {
  useEffect(() => {
    const handleFocus = (e) => {
      // Verifica se o elemento focado é um input ou textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        // Pequeno delay para garantir que o teclado já abriu
        setTimeout(() => {
          e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    };

    // Adiciona o evento de foco em toda a página
    document.addEventListener('focusin', handleFocus);
    
    // Remove o evento quando o componente desmontar
    return () => document.removeEventListener('focusin', handleFocus);
  }, []);
};