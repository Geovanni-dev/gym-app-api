import React, { useState, useRef, useEffect } from 'react';
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
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const ProfileSideMenu = ({ isOpen, onClose, user, setView, logout, securityContent }) => {
  const { updateUserData } = useAuth();
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('profileImg', file);
    setUploading(true);
    try {
      const response = await api.post('/users/upload-profile-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const newImageUrl = response.data.profileImg;
      updateUserData({ profileImg: newImageUrl });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      alert("Falha no upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/90 backdrop-blur-md z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      <div
        className={`fixed top-0 right-0 h-full w-[340px] max-w-[90vw] bg-black border-l border-white/80 z-[101] transform transition-transform duration-500 ease-out overflow-hidden rounded-l-[50px] ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1656785280286-3cd303399113?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            className="w-full h-full object-cover opacity-100 grayscale" 
            alt="Background"
            onError={(e) => e.target.style.display = 'none'}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
        </div>

        {/* Ajuste: Mudei p-6 para px-6 pb-6 pt-2 para subir o conteúdo */}
        <div className="relative z-10 h-full px-6 pb-6 pt-2 overflow-y-auto no-scrollbar">
          
          {/* Ajuste: Mudei mb-10 para mb-2 para tirar o espaço vazio no topo */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 shrink-0">
            
            </div>
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          {/* Ajuste: Adicionei -mt-10 para a foto subir e encostar lá em cima */}
          <div className="flex flex-col items-center text-center space-y-4 mb-8 pb-8 border-b border-white/10 -mt-10">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-white/10 border-2 border-gray-900">
                {user?.profileImg ? (
                  <img 
                    src={user.profileImg} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; }}
                  />
                ) : (
                  <div className={`w-full h-full ${theme.colors.primaryBg} flex items-center justify-center text-black`}>
                    <UserIcon size={48} strokeWidth={2.5} />
                  </div>
                )}
              </div>
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="absolute bottom-0 right-0 p-2 bg-black border border-white/10 rounded-full text-[#ff6600] hover:scale-110 transition-all shadow-lg">
                <Camera size={14} />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
            </div>
            {uploading && <p className="text-[10px] text-gray-500 animate-pulse">Sincronizando foto...</p>}
            <div>
              <h3 className="text-[15px] font-black italic uppercase text-white leading-none tracking-tight">{user?.name || "Atleta Elite"}</h3>
            </div>
          </div>

          <div className="space-y-4">
            <div className={`border border-white/80 rounded-2xl overflow-hidden transition-all duration-300 ${isSecurityOpen ? 'bg-white/[0.02]' : ''}`}>
              <button onClick={() => setIsSecurityOpen(!isSecurityOpen)} className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-3 text-gray-400">
                  <ShieldAlert size={18} className={isSecurityOpen ? "text-[#ff6600]" : "text-gray-500"} />
                  <h4 className={`text-xs font-black uppercase tracking-widest transition-colors ${isSecurityOpen ? 'text-white' : ''}`}>Segurança</h4>
                </div>
                {isSecurityOpen ? <ChevronUp size={16} className="text-gray-600" /> : <ChevronDown size={16} className="text-gray-600" />}
              </button>
              <div className={`transition-all duration-300 overflow-hidden ${isSecurityOpen ? 'max-h-[600px] opacity-100 p-5 pt-0' : 'max-h-0 opacity-0'}`}>
                {securityContent}
              </div>
            </div>
            <div className="pt-4 space-y-4">
              <button onClick={() => {
      logout();
      setView('landing');
    }}  
    className="w-full flex items-center justify-center gap-3 py-4 rounded-xl bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-[0.2em] border border-red-500/10 hover:bg-red-500/10 transition-all active:scale-95">
                <LogOut size={16} /> Encerrar Sessão
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};