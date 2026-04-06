import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';

import { 
  Dumbbell, 
  LayoutDashboard, 
  History, 
  User as UserIcon, 
  Zap,
  LogIn,
  UserPlus, 
  ShieldCheck, 
  KeyRound, 
  Mail,
  Lock,
  User,
  ArrowLeft,
  ArrowRight,
  Eye, 
  EyeOff,
  AlertCircle,
  CheckCircle2,
  LogOut,
  Settings, 
  ShieldAlert,
  Camera,
  X,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Save,
  ChevronRight,
  Trophy,
  Activity,
  Flame,
  Target,
  Clock,
  Sparkles,
  CheckSquare,
  Square,
  AlertTriangle,
  Edit3,
  Check,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

// --- CONFIGURAÇÃO DA API ---
const api = axios.create({
  baseURL: 'http://localhost:3000', 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@IronSoul:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const theme = {
  colors: {
    background: 'bg-[#000000]',
    surface: 'bg-[#0a0a0a]',
    surfaceLight: 'bg-[#111111]',
    primary: 'text-[#d4ff00]',
    primaryBg: 'bg-[#d4ff00]',
    primaryHover: 'hover:bg-[#bade00]',
    border: 'border-white/10',
    error: 'text-red-500',
    success: 'text-[#d4ff00]'
  }
};

// --- SCHEMAS ---
const loginSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Nome muito curto"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

const verifySchema = z.object({
  code: z.string().length(6, "Código deve ter 6 dígitos"),
});

const forgotPasswordSchema = z.object({
  email: z.string().email("E-mail inválido"),
});

const resetPasswordSchema = z.object({
  code: z.string().length(6, "Código inválido"),
  password: z.string().min(6, "Mínimo 6 caracteres"),
});

const changePasswordSchema = z.object({
  oldPassword: z.string().min(6, "Mínimo 6 caracteres"),
  newPassword: z.string().min(6, "A nova senha deve ter 6+ caracteres"),
}).refine((data) => data.oldPassword !== data.newPassword, {
  message: "A nova senha deve ser diferente da atual",
  path: ["newPassword"],
});

const planSchema = z.object({
  name: z.string().min(1, "O nome do plano é obrigatório"),
  days: z.array(z.object({
    name: z.string().min(1, "O nome do dia é obrigatório"),
    exercises: z.array(z.object({
      name: z.string().min(1, "O nome do exercício é obrigatório"),
      sets: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().min(1, "Mínimo 1 série")),
      reps: z.string().min(1, "Reps obrigatórias"),
      weight: z.preprocess((val) => (val === "" ? undefined : Number(val)), z.number().min(0, "Peso deve ser positivo"))
    }))
  }))
});

// --- AUTH CONTEXT ---
const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('@IronSoul:token'));

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  const login = async (data) => {
    try {
      const response = await api.post('/users/login', data);
      const { token: receivedToken } = response.data;
      setToken(receivedToken);
      localStorage.setItem('@IronSoul:token', receivedToken);
      setUser({ email: data.email, name: 'Atleta Elite' });
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Credenciais inválidas" };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('@IronSoul:token');
    delete api.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// --- COMPONENTES UI ---

const StatusMessage = ({ type, message }) => {
  if (!message) return null;
  return (
    <div className="animate-in fade-in duration-300 mb-4">
      <div className={`flex items-center gap-2 p-4 rounded-xl border ${type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-[#d4ff00]/10 border-[#d4ff00]/20 text-[#d4ff00]'}`}>
        {type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
        <span className="text-xs font-bold uppercase tracking-wider">{message}</span>
      </div>
    </div>
  );
};

const InputField = React.forwardRef(({ label, icon: Icon, error, type = "text", ...props }, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="space-y-1.5 w-full text-left">
      <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1 flex items-center gap-2">
        {Icon && <Icon size={12} />} {label}
      </label>
      <div className="relative">
        <input 
          {...props}
          ref={ref}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          className={`w-full bg-black/50 border ${error ? 'border-red-500' : 'border-white/10'} rounded-xl p-4 pr-12 text-white focus:border-[#d4ff00] outline-none transition-all placeholder:text-gray-800 no-spinners`}
        />
        {isPassword && (
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-[#d4ff00] transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {error && <span className="text-[10px] font-bold text-red-500 ml-1 uppercase">{error}</span>}
    </div>
  );
});

const AuthWrapper = ({ title, subtitle, children, onSubmit, onBack, uiMessage, loading }) => (
  <div className={`min-h-screen ${theme.colors.background} flex items-center justify-center p-6`}>
    <div className={`p-8 rounded-[2rem] ${theme.colors.surfaceLight} border ${theme.colors.border} w-full max-w-md space-y-8 shadow-2xl relative overflow-hidden`}>
      <button onClick={onBack} className="absolute top-6 left-6 text-gray-600 hover:text-white transition-colors">
        <ArrowLeft size={20} />
      </button>
      <div className="text-center space-y-2 pt-4">
        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">{title}</h2>
        <p className="text-gray-500 text-sm font-medium">{subtitle}</p>
      </div>
      
      <StatusMessage type={uiMessage.type} message={uiMessage.text} />

      <form onSubmit={onSubmit} className="space-y-5">
        {children}
        {loading && <div className="text-center text-[10px] text-[#d4ff00] animate-pulse uppercase font-black tracking-widest">Sincronizando...</div>}
      </form>
    </div>
  </div>
);

const Navbar = ({ activeTab, setActiveTab, onOpenProfile }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;

  const tabs = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Início' },
    { id: 'history', icon: History, label: 'Histórico' },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 ${theme.colors.surfaceLight} border-t ${theme.colors.border} px-8 py-4 z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b shadow-2xl`}>
      <div className="max-w-md mx-auto flex justify-between items-center md:max-w-6xl">
        <button 
          onClick={onOpenProfile}
          className="flex flex-col items-center gap-1 text-gray-500 hover:text-[#d4ff00] transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-[#d4ff00]/50 transition-all">
             <UserIcon size={18} />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest">Perfil</span>
        </button>

        <div className="flex gap-16 md:gap-24">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? `${theme.colors.primary} scale-110` : 'text-gray-500 hover:text-white'}`}>
                <Icon size={22} />
                <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden md:flex items-center gap-2">
          <Zap className={theme.colors.primary} fill="currentColor" size={20} />
          <span className="font-black text-lg tracking-tighter text-white italic uppercase">IRON<span className={theme.colors.primary}>& SOUL</span></span>
        </div>
      </div>
    </nav>
  );
};

const ProfileSideMenu = ({ isOpen, onClose, user, logout, securityContent }) => {
    const [isSecurityOpen, setIsSecurityOpen] = useState(false);

    return (
        <>
            <div 
                className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
                onClick={onClose}
            />
            <div className={`fixed top-0 left-0 h-full w-[340px] max-w-[90vw] ${theme.colors.surfaceLight} border-r ${theme.colors.border} z-[101] transform transition-transform duration-500 ease-out p-6 overflow-y-auto no-scrollbar ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="flex items-center justify-between mb-10">
                    <div className="flex items-center gap-3">
                        <Zap className={theme.colors.primary} size={22} fill="currentColor" />
                        <span className="text-white font-black italic uppercase tracking-tighter text-lg">Arena Profile</span>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
                </div>

                <div className="flex flex-col items-center text-center space-y-4 mb-8 pb-8 border-b border-white/5">
                    <div className="relative group">
                        <div className={`w-24 h-24 rounded-full ${theme.colors.primaryBg} flex items-center justify-center text-black shadow-[0_0_40px_rgba(212,255,0,0.15)]`}>
                            <UserIcon size={48} strokeWidth={2.5} />
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-black border border-white/10 rounded-full text-[#d4ff00] hover:scale-110 transition-all">
                            <Camera size={14} />
                        </button>
                    </div>
                    <div>
                        <h3 className="text-xl font-black italic uppercase text-white leading-none tracking-tight">{user?.name}</h3>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">{user?.email}</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className={`border border-white/5 rounded-2xl overflow-hidden transition-all duration-300 ${isSecurityOpen ? 'bg-white/[0.02]' : ''}`}>
                        <button 
                            onClick={() => setIsSecurityOpen(!isSecurityOpen)}
                            className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-3 text-gray-400">
                                <ShieldAlert size={18} className={isSecurityOpen ? theme.colors.primary : 'text-gray-500'} />
                                <h4 className={`text-xs font-black uppercase tracking-widest transition-colors ${isSecurityOpen ? 'text-white' : ''}`}>Segurança</h4>
                            </div>
                            {isSecurityOpen ? <ChevronUp size={16} className="text-gray-600" /> : <ChevronDown size={16} className="text-gray-600" />}
                        </button>

                        <div className={`transition-all duration-300 overflow-hidden ${isSecurityOpen ? 'max-h-[600px] opacity-100 p-5 pt-0' : 'max-h-0 opacity-0'}`}>
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

const LandingPage = ({ onStart }) => (
  <div className={`min-h-screen ${theme.colors.background} text-white relative flex flex-col items-center justify-center overflow-hidden`}>
    <div 
      className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-60 scale-105 transition-transform duration-[10s] hover:scale-110"
      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop')` }}
    />
    <div className="absolute inset-0 z-10 bg-gradient-to-t from-black via-black/80 to-transparent" />

    <div className="z-20 text-center px-6 max-w-4xl space-y-12">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Zap className={theme.colors.primary} fill="currentColor" size={32} />
        <span className="font-black text-3xl tracking-tighter italic uppercase">IRON <span className={theme.colors.primary}>& SOUL</span></span>
      </div>

      <h1 className="text-6xl md:text-[9rem] font-black italic tracking-tighter leading-[0.85] uppercase animate-in slide-in-from-bottom duration-700">
        ONDE O <span className={theme.colors.primary}>BACKEND</span><br />
        VIRA MÚSCULO.
      </h1>

      <div className="flex flex-col md:flex-row items-center justify-center gap-5 pt-6">
        <button 
          onClick={() => onStart('register')}
          className={`group w-full md:w-auto py-5 px-10 rounded-xl font-black italic text-black transition-all flex items-center justify-center gap-3 ${theme.colors.primaryBg} ${theme.colors.primaryHover} shadow-[0_0_40px_rgba(212,255,0,0.35)] active:scale-95`}
        >
          INICIAR JORNADA <UserPlus size={22} className="group-hover:translate-x-1 transition-transform" />
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

// --- COMPONENTES DE TREINO ---

const MetricCard = ({ icon: Icon, label, value, colorClass = "text-white" }) => (
  <div className="bg-white/[0.03] backdrop-blur-md border border-white/5 p-5 rounded-2xl space-y-3 hover:border-[#d4ff00]/20 transition-all group">
    <div className="p-2 bg-white/5 w-fit rounded-lg group-hover:bg-[#d4ff00]/10 transition-colors">
      <Icon className={colorClass} size={16} />
    </div>
    <div className="space-y-0.5">
      <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1 flex items-center gap-2">
        {Icon && <Icon size={12} />} {label}
      </label>
      <div className={`text-2xl font-black italic tracking-tighter uppercase ${colorClass}`}>{value}</div>
    </div>
  </div>
);

const DayAccordion = ({ register, dayIndex, removeDay, control }) => {
  const { fields: exercises, append, remove } = useFieldArray({
    control,
    name: `days.${dayIndex}.exercises`
  });

  return (
    <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <input 
          {...register(`days.${dayIndex}.name`)} 
          placeholder="Ex: Segunda-feira"
          className="bg-transparent text-lg font-black italic uppercase tracking-tight text-[#d4ff00] outline-none border-none focus:ring-0 day-name-input"
        />
        <button type="button" onClick={() => removeDay(dayIndex)} className="text-red-500 hover:scale-110 transition-transform">
          <Trash2 size={18} />
        </button>
      </div>

      <div className="space-y-3">
        {exercises.map((ex, exIndex) => (
          <div key={ex.id} className="grid grid-cols-12 gap-2 items-end bg-white/[0.02] p-3 rounded-xl border border-white/5">
            <div className="col-span-12 md:col-span-5">
               <label className="text-[8px] uppercase font-bold text-gray-600 block mb-1">Exercício</label>
               <input {...register(`days.${dayIndex}.exercises.${exIndex}.name`)} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white" />
            </div>
            <div className="col-span-3 md:col-span-2 text-center">
               <label className="text-[8px] uppercase font-bold text-gray-600 block mb-1">Séries</label>
               <input 
                 type="number" 
                 {...register(`days.${dayIndex}.exercises.${exIndex}.sets`)} 
                 className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white text-center no-spinners" 
               />
            </div>
            <div className="col-span-3 md:col-span-2 text-center">
               <label className="text-[8px] uppercase font-bold text-gray-600 block mb-1">Reps</label>
               <input {...register(`days.${dayIndex}.exercises.${exIndex}.reps`)} className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white text-center" />
            </div>
            <div className="col-span-4 md:col-span-2 text-center">
               <label className="text-[8px] uppercase font-bold text-gray-600 block mb-1">Peso (KG)</label>
               <input 
                 type="number" 
                 {...register(`days.${dayIndex}.exercises.${exIndex}.weight`)} 
                 className="w-full bg-black/40 border border-[#d4ff00]/30 rounded-lg p-2 text-xs text-[#d4ff00] font-bold text-center no-spinners" 
               />
            </div>
            <div className="col-span-2 md:col-span-1 flex justify-center pb-2">
               <button type="button" onClick={() => remove(exIndex)} className="text-gray-600 hover:text-red-500"><X size={16} /></button>
            </div>
          </div>
        ))}
        <button 
          type="button" 
          onClick={() => append({ name: '', sets: '', reps: '', weight: '' })}
          className="w-full py-2 border-2 border-dashed border-white/5 rounded-xl text-[10px] font-black uppercase text-gray-500 hover:border-[#d4ff00] hover:text-[#d4ff00] transition-all flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Adicionar Exercício
        </button>
      </div>
    </div>
  );
};

// --- VIEW DE DETALHES DO PLANO ---

const PlanDetailsView = ({ 
  plan, 
  onBack, 
  completedExercises, 
  toggleCheck, 
  onDeletePlan, 
  onDeleteExercise,
  onUpdatePlanName,
  onUpdateDayName,
  onUpdateExercise,
  onReorderDays,
  onAddExercise,
  onAddDay,
  onDeleteDay
}) => {
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [editingPlanName, setEditingPlanName] = useState(null);
  const [editingDayIdx, setEditingDayIdx] = useState(null);
  const [tempDayName, setTempDayName] = useState("");
  const [editingExercise, setEditingExercise] = useState(null); 
  const [addingToDay, setAddingToDay] = useState(null); 
  const [addingNewDay, setAddingNewDay] = useState(false);
  const [newDayTitle, setNewDayTitle] = useState("");
  const [newExData, setNewExData] = useState({ name: '', sets: '', reps: '', weight: '' });

  // Estado de visibilidade dos dias persistente no localStorage
  const [openDays, setOpenDays] = useState(() => {
    const saved = localStorage.getItem('@IronSoul:openDays');
    return saved ? JSON.parse(saved) : {}; 
  });

  const toggleDayVisibility = (dayName) => {
    setOpenDays(prev => {
        const newState = { ...prev, [dayName]: !prev[dayName] };
        localStorage.setItem('@IronSoul:openDays', JSON.stringify(newState));
        return newState;
    });
  };

  const handleConfirm = () => {
    if (confirmTarget.type === 'plan') {
      onDeletePlan(confirmTarget.id);
    } else if (confirmTarget.type === 'exercise') {
      onDeleteExercise(confirmTarget.planId, confirmTarget.day, confirmTarget.exercise);
    } else if (confirmTarget.type === 'day') {
      onDeleteDay(confirmTarget.planId, confirmTarget.dayName);
    }
    setConfirmTarget(null);
  };

  const handleAddNewEx = async (e) => {
    e.preventDefault();
    if (!newExData.name || !newExData.sets) return;
    
    await onAddExercise(plan._id || plan.id, addingToDay, {
        ...newExData,
        sets: Number(newExData.sets),
        weight: Number(newExData.weight) || 0
    });
    
    setAddingToDay(null);
    setNewExData({ name: '', sets: '', reps: '', weight: '' });
  };

  const handleAddNewDay = async (e) => {
    e.preventDefault();
    if (!newDayTitle.trim()) return;
    await onAddDay(plan._id || plan.id, newDayTitle);
    setAddingNewDay(false);
    setNewDayTitle("");
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-right-6 duration-500 pb-28 relative">
      {/* MODAL ADICIONAR EXERCÍCIO */}
      {addingToDay && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
           <div className="bg-[#111111] border border-white/5 p-8 rounded-[2rem] w-full max-w-[420px] space-y-8 shadow-2xl">
              <div className="space-y-2 text-center">
                  <div className="w-12 h-12 bg-[#d4ff00]/10 text-[#d4ff00] rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Plus size={24} />
                  </div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Novo Exercício</h3>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed">Adicionando ao protocolo de {addingToDay}</p>
              </div>

              <form onSubmit={handleAddNewEx} className="space-y-5">
                  <div className="space-y-4">
                      <div className="space-y-1.5">
                          <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">Nome</label>
                          <input autoFocus className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:border-[#d4ff00] outline-none" value={newExData.name} onChange={(e) => setNewExData({...newExData, name: e.target.value})} placeholder="Ex: Supino Reto" />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">Séries</label>
                            <input type="number" className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white text-center focus:border-[#d4ff00] outline-none no-spinners" value={newExData.sets} onChange={(e) => setNewExData({...newExData, sets: e.target.value})} placeholder="4" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">Reps</label>
                            <input className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white text-center focus:border-[#d4ff00] outline-none" value={newExData.reps} onChange={(e) => setNewExData({...newExData, reps: e.target.value})} placeholder="12" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">Carga</label>
                            <input type="number" className="w-full bg-black/50 border border-[#d4ff00]/20 rounded-xl p-4 text-[#d4ff00] font-black text-center focus:border-[#d4ff00] outline-none no-spinners" value={newExData.weight} onChange={(e) => setNewExData({...newExData, weight: e.target.value})} placeholder="KG" />
                        </div>
                      </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                      <button type="button" onClick={() => setAddingToDay(null)} className="py-4 bg-white/5 text-gray-400 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white/10 transition-all">Cancelar</button>
                      <button type="submit" className="py-4 bg-[#d4ff00] text-black font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-[#bade00] transition-all shadow-lg active:scale-95">Adicionar</button>
                  </div>
              </form>
           </div>
        </div>
      )}

      {confirmTarget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/90 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[#111111] border border-red-500/20 p-8 rounded-[2rem] w-full max-w-[420px] space-y-6 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">CUIDADO ATLETA!</h3>
              <p className="text-gray-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
                Estás prestes a excluir {confirmTarget.type === 'plan' ? 'este PROTOCOLO' : confirmTarget.type === 'day' ? 'este DIA' : 'este EXERCÍCIO'}. Queres mesmo prosseguir?
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button onClick={() => setConfirmTarget(null)} className="py-4 bg-white/5 text-gray-400 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-white/10 transition-all">Cancelar</button>
              <button onClick={handleConfirm} className="py-4 bg-red-600 text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-red-700 transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)]">Confirmar</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-6 overflow-hidden flex-1">
          <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl text-gray-500 hover:text-white hover:bg-white/10 transition-all active:scale-90 flex-shrink-0">
            <ArrowLeft size={28} />
          </button>
          <div className="group relative overflow-hidden flex-1">
            {editingPlanName !== null ? (
              <div className="flex items-center gap-3 w-full">
                <input 
                  autoFocus
                  className="bg-transparent text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white border-b-2 border-[#d4ff00] outline-none flex-1 min-w-0"
                  value={editingPlanName}
                  onChange={(e) => setEditingPlanName(e.target.value)}
                />
                <button onClick={() => { onUpdatePlanName(plan._id || plan.id, editingPlanName); setEditingPlanName(null); }} className="p-2 text-[#d4ff00] flex-shrink-0"><Check size={24}/></button>
              </div>
            ) : (
              <div className="flex items-center gap-4 overflow-hidden">
                <h1 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-tight break-words">{plan.name}</h1>
                <button onClick={() => setEditingPlanName(plan.name)} className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-[#d4ff00] transition-all flex-shrink-0"><Edit3 size={18}/></button>
              </div>
            )}
            <div className="flex items-center gap-3 mt-3">
               <div className="px-3 py-1 bg-[#d4ff00] text-black text-[9px] font-black uppercase tracking-widest rounded-full italic">Arena Mode</div>
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em]">Protocolo Sincronizado</p>
            </div>
          </div>
        </div>

        <button onClick={() => setConfirmTarget({ type: 'plan', id: plan._id || plan.id })} className="p-4 bg-red-500/5 text-red-500 rounded-2xl border border-red-500/10 hover:bg-red-500/10 transition-all flex-shrink-0 ml-4">
          <Trash2 size={24} />
        </button>
      </div>

      <div className="grid gap-12">
        {plan.days?.map((day, dIdx) => {
          const isVisible = !!openDays[day.name];

          return (
            <div key={dIdx} className="space-y-6">
              <div className="flex items-center gap-4 px-2 group/day overflow-hidden">
                <div className="h-px flex-grow bg-white/5"></div>
                
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex flex-col gap-1 transition-opacity">
                    <button disabled={dIdx === 0} onClick={() => onReorderDays(plan._id || plan.id, dIdx, 'up')} className="text-gray-600 hover:text-[#d4ff00] disabled:opacity-0"><ChevronUp size={14}/></button>
                    <button disabled={dIdx === plan.days.length - 1} onClick={() => onReorderDays(plan._id || plan.id, dIdx, 'down')} className="text-gray-600 hover:text-[#d4ff00] disabled:opacity-0"><ChevronDown size={14}/></button>
                  </div>

                  {editingDayIdx === dIdx ? (
                     <div className="flex items-center gap-2 max-w-full">
                       <input 
                          autoFocus
                          className="bg-transparent text-xl md:text-2xl font-black italic uppercase text-[#d4ff00] border-b border-[#d4ff00] outline-none text-center min-w-0 max-w-[150px] md:max-w-none"
                          value={tempDayName}
                          onChange={(e) => setTempDayName(e.target.value)}
                       />
                       <button onClick={() => { onUpdateDayName(plan._id || plan.id, day.name, tempDayName); setEditingDayIdx(null); }} className="text-[#d4ff00] flex-shrink-0"><Check size={18}/></button>
                     </div>
                  ) : (
                    <div className="flex items-center gap-3 overflow-hidden">
                      <button 
                        onClick={() => toggleDayVisibility(day.name)}
                        className="flex items-center gap-3 group/title"
                      >
                        <h3 className="text-2xl font-black italic uppercase text-[#d4ff00] tracking-tight break-words group-hover/title:drop-shadow-[0_0_8px_rgba(212,255,0,0.5)] transition-all">
                          {day.name}
                        </h3>
                        <div className={`transition-transform duration-300 ${isVisible ? 'rotate-180' : ''}`}>
                          <ChevronDown size={20} className="text-[#d4ff00]/40 group-hover/title:text-[#d4ff00]" />
                        </div>
                      </button>

                      <div className="flex items-center gap-1">
                          <button onClick={() => { setEditingDayIdx(dIdx); setTempDayName(day.name); }} className="p-1.5 text-gray-600 hover:text-white transition-all"><Edit3 size={14}/></button>
                          <button onClick={() => setAddingToDay(day.name)} className="p-1.5 text-gray-600 hover:text-[#d4ff00] transition-all flex items-center gap-1">
                              <Plus size={14} /> <span className="text-[8px] font-black uppercase tracking-widest hidden md:inline">Adicionar Exercício</span>
                          </button>
                          <button onClick={() => setConfirmTarget({ type: 'day', planId: plan._id || plan.id, dayName: day.name })} className="p-1.5 text-gray-600 hover:text-red-500 transition-all">
                              <Trash2 size={14} />
                          </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-px flex-grow bg-white/5"></div>
              </div>
              
              {/* Visibilidade condicional com transição suave slide + fade */}
              {isVisible && (
                <div className="grid gap-5 md:grid-cols-2 animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
                  {day.exercises?.map((ex, eIdx) => {
                    const checkKey = `${plan._id || plan.id}-${dIdx}-${eIdx}`;
                    const isCompleted = !!completedExercises[checkKey];
                    const isEditingEx = editingExercise?.day === day.name && editingExercise?.exerciseName === ex.name;
                    
                    const DecorativeIcon = eIdx % 3 === 0 ? Dumbbell : eIdx % 3 === 1 ? Zap : Flame;

                    return (
                      <div key={eIdx} className={`group relative min-h-[90px] sm:min-h-[160px] rounded-[1.6rem] sm:rounded-[2.5rem] border overflow-hidden transition-all duration-300 ${isCompleted ? 'border-[#d4ff00] scale-[0.98] shadow-[0_0_20px_rgba(212,255,0,0.15)] bg-[#050505]' : 'border-white/20 bg-white/[0.03] hover:border-[#d4ff00]/40 shadow-lg'}`}>
                        <div className={`absolute inset-0 transition-colors duration-500 ${isCompleted ? 'bg-[#050505]' : 'bg-gradient-to-br from-[#0a0a0a] via-black to-[#0d0d0d] group-hover:via-[#111111]'}`} />
                        <div className={`absolute -right-4 -bottom-6 transition-opacity duration-500 text-[#d4ff00] transform rotate-12 ${isCompleted ? 'opacity-[0.1]' : 'opacity-[0.03] group-hover:opacity-[0.07]'}`}>
                          <DecorativeIcon size={160} strokeWidth={2.5} />
                        </div>
                        <div className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${isCompleted ? 'bg-[#d4ff00]' : 'bg-[#d4ff00] opacity-30 group-hover:opacity-100 group-hover:w-2'}`} />
                        
                        <div className="relative z-10 h-full p-2.5 sm:p-6 md:p-8 flex items-center justify-between gap-1 sm:gap-4">
                          {isEditingEx ? (
                            <div className="w-full space-y-3 animate-in fade-in zoom-in-95 duration-200">
                               <input 
                                 className="w-full bg-black/60 border border-[#d4ff00]/30 rounded-xl p-2 text-white font-black uppercase italic outline-none focus:border-[#d4ff00]"
                                 value={editingExercise.data.name}
                                 onChange={(e) => setEditingExercise({...editingExercise, data: {...editingExercise.data, name: e.target.value}})}
                               />
                               <div className="grid grid-cols-3 gap-2">
                                 <div className="space-y-0.5">
                                   <label className="text-[7px] uppercase font-black text-gray-500">Sets</label>
                                   <input type="number" className="w-full bg-black/60 border border-white/10 rounded-lg p-1 text-center text-white font-bold no-spinners" value={editingExercise.data.sets} onChange={(e) => setEditingExercise({...editingExercise, data: {...editingExercise.data, sets: Number(e.target.value)}})} />
                                 </div>
                                 <div className="space-y-0.5">
                                   <label className="text-[7px] uppercase font-black text-gray-500">Reps</label>
                                   <input className="w-full bg-black/60 border border-white/10 rounded-lg p-1 text-center text-white font-bold" value={editingExercise.data.reps} onChange={(e) => setEditingExercise({...editingExercise, data: {...editingExercise.data, reps: e.target.value}})} />
                                 </div>
                                 <div className="space-y-0.5">
                                   <label className="text-[7px] uppercase font-black text-gray-500">Peso</label>
                                   <input type="number" className="w-full bg-black/60 border border-[#d4ff00]/20 rounded-lg p-1 text-center text-[#d4ff00] font-bold no-spinners" value={editingExercise.data.weight} onChange={(e) => setEditingExercise({...editingExercise, data: {...editingExercise.data, weight: Number(e.target.value)}})} />
                                 </div>
                               </div>
                               <div className="flex gap-2">
                                 <button onClick={() => setEditingExercise(null)} className="flex-grow py-1.5 rounded-lg bg-white/5 text-gray-400 font-black uppercase text-[8px] tracking-widest">Cancelar</button>
                                 <button onClick={() => { onUpdateExercise(plan._id || plan.id, day.name, ex.name, editingExercise.data); setEditingExercise(null); }} className="flex-grow py-1.5 rounded-lg bg-[#d4ff00] text-black font-black uppercase text-[8px] tracking-widest">Salvar</button>
                               </div>
                            </div>
                          ) : (
                            <>
                            <div className="flex items-center gap-2 sm:gap-6 flex-grow min-w-0 cursor-pointer" onClick={() => toggleCheck(checkKey)}>
                              <div className={`flex-shrink-0 transition-all duration-300 ${isCompleted ? 'text-[#d4ff00] scale-110 drop-shadow-[0_0_10px_#d4ff00]' : 'text-white/20 group-hover:text-[#d4ff00]/50 group-hover:scale-110'}`}>
                                <CheckSquare className="w-5 h-5 sm:w-9 sm:h-9" strokeWidth={2.5} />
                              </div>
      
                              <div className="space-y-1 sm:space-y-3 min-w-0 overflow-hidden">
                                <h4 className={`text-[11px] sm:text-lg md:text-xl font-black uppercase italic tracking-tight transition-all truncate leading-tight ${isCompleted ? 'text-[#d4ff00] drop-shadow-[0_0_10px_rgba(212,255,0,0.5)]' : 'text-white group-hover:text-[#d4ff00]'}`}>{ex.name}</h4>
                                <div className="flex items-center gap-3 sm:gap-8 overflow-visible">
                                  <div className="space-y-0.5 flex-shrink-0 min-w-[20px]">
                                    <p className="text-[6px] sm:text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">Séries</p>
                                    <p className={`text-[10px] sm:text-lg font-black italic transition-colors leading-none ${isCompleted ? 'text-[#d4ff00]' : 'text-white'}`}>{ex.sets}</p>
                                  </div>
                                  <div className="space-y-0.5 flex-shrink-0 min-w-[20px]">
                                    <p className="text-[6px] sm:text-[9px] font-black text-gray-500 uppercase tracking-widest leading-none">Reps</p>
                                    <p className={`text-[10px] sm:text-lg font-black italic transition-colors leading-none ${isCompleted ? 'text-[#d4ff00]' : 'text-white'}`}>{ex.reps}</p>
                                  </div>
                                  <div className="space-y-0.5 flex-shrink-0 min-w-[30px]">
                                    <p className="text-[6px] sm:text-[9px] font-black text-[#d4ff00]/60 uppercase tracking-widest leading-none">Carga</p>
                                    <p className="text-[10px] sm:text-lg font-black italic text-[#d4ff00] leading-tight pb-0.5 whitespace-nowrap">{ex.weight}kg</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col gap-1 sm:gap-1.5 flex-shrink-0">
                              <button onClick={(e) => { e.stopPropagation(); setConfirmTarget({ type: 'exercise', planId: plan._id || plan.id, day: day.name, exercise: ex.name }); }} className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-colors md:opacity-0 group-hover:opacity-100">
                                <X size={12} className="sm:size-[16px]" />
                              </button>
                              <button onClick={(e) => { e.stopPropagation(); setEditingExercise({ day: day.name, exerciseName: ex.name, data: { ...ex } }); }} className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-white/5 text-gray-400 flex items-center justify-center hover:bg-[#d4ff00]/10 hover:text-[#d4ff00] transition-all md:opacity-0 group-hover:opacity-100">
                                <Edit3 size={12} className="sm:size-[16px]" />
                              </button>
                              <div className={`hidden sm:flex w-8 h-8 rounded-xl items-center justify-center transition-all ${isCompleted ? 'bg-[#d4ff00]/20 text-[#d4ff00]' : 'bg-white/5 text-white/20'}`}><Dumbbell size={16} /></div>
                            </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* BOTÃO ADICIONAR DIA AO PROTOCOLO EXISTENTE - RESPONSIVO PARA TELAS PEQUENAS */}
        <div className="pt-4 px-2">
            {addingNewDay ? (
                <form onSubmit={handleAddNewDay} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-white/[0.03] p-4 sm:p-6 rounded-[2rem] border border-dashed border-[#d4ff00]/30 animate-in fade-in zoom-in-95">
                    <input 
                        autoFocus
                        className="bg-transparent text-base sm:text-xl font-black italic uppercase text-[#d4ff00] border-b border-[#d4ff00] outline-none flex-1 min-w-0 px-2 py-2"
                        placeholder="NOME DO DIA"
                        value={newDayTitle}
                        onChange={(e) => setNewDayTitle(e.target.value)}
                    />
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setAddingNewDay(false)} className="p-2 text-gray-500 hover:text-white"><X size={20}/></button>
                        <button type="submit" className="p-2 text-[#d4ff00]"><Check size={24}/></button>
                    </div>
                </form>
            ) : (
                <button 
                    onClick={() => setAddingNewDay(true)}
                    className="w-full py-4 sm:py-6 border-2 border-dashed border-white/5 rounded-[2rem] sm:rounded-[2.5rem] text-[10px] font-black uppercase text-gray-500 hover:border-[#d4ff00] hover:text-[#d4ff00] transition-all flex items-center justify-center gap-3 group"
                >
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#d4ff00] group-hover:text-black transition-all">
                        <Plus size={14} strokeWidth={3} className="sm:size-[18px]" />
                    </div>
                    Adicionar Novo Dia ao Protocolo
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

// --- MAIN CONTENT ---

function MainContent() {
  const { isAuthenticated, login, logout, user } = useAuth();
  const [view, setView] = useState('landing'); 
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [tempEmail, setTempEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [uiMessage, setUiMessage] = useState({ type: '', text: '' });
  const [isInternalReset, setIsInternalReset] = useState(false);

  const [plans, setPlans] = useState([]);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  const [completedExercises, setCompletedExercises] = useState(() => {
    const saved = localStorage.getItem('@IronSoul:completed');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    localStorage.setItem('@IronSoul:completed', JSON.stringify(completedExercises));
  }, [completedExercises]);

  useEffect(() => {
    const checkExpiry = () => {
      const now = Date.now();
      const expiryTime = 5 * 60 * 60 * 1000; 
      let hasExpired = false;
      const updatedState = { ...completedExercises };
      Object.keys(updatedState).forEach(key => {
        if (updatedState[key].timestamp && (now - updatedState[key].timestamp > expiryTime)) {
          delete updatedState[key];
          hasExpired = true;
        }
      });
      if (hasExpired) setCompletedExercises(updatedState);
    };
    const interval = setInterval(checkExpiry, 60000); 
    return () => clearInterval(interval);
  }, [completedExercises]);

  const toggleCheck = (key) => {
    setCompletedExercises(prev => {
      if (prev[key]) {
        const { [key]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: { completed: true, timestamp: Date.now() } };
    });
  };

  const fetchPlans = async () => {
    try {
        const response = await api.get('/workout-plans');
        const formattedPlans = response.data.map(p => ({
            ...p,
            daysCount: p.days?.length || 0
        }));
        setPlans(formattedPlans);
        if (selectedPlan) {
            const updated = formattedPlans.find(p => (p._id || p.id) === (selectedPlan._id || selectedPlan.id));
            if (updated) setSelectedPlan(updated);
        }
    } catch (e) { console.error("Erro ao carregar planos", e); }
  };

  const onUpdatePlanName = async (planId, newName) => {
    setLoading(true);
    try {
      await api.put(`/workout-plans/${planId}/name`, { name: newName });
      setUiMessage({ type: 'success', text: "Protocolo renomeado!" });
      fetchPlans();
    } catch (e) { setUiMessage({ type: 'error', text: "Erro ao atualizar nome." }); }
    finally { setLoading(false); }
  };

  const onUpdateDayName = async (planId, oldDayName, newDayName) => {
    setLoading(true);
    try {
      await api.put(`/workout-plans/${planId}/day/${oldDayName}`, { name: newDayName });
      setUiMessage({ type: 'success', text: "Dia atualizado!" });
      fetchPlans();
    } catch (e) { setUiMessage({ type: 'error', text: e.response?.data?.message || "Erro de servidor (400)" }); }
    finally { setLoading(false); }
  };

  const onUpdateExercise = async (planId, dayName, exerciseName, data) => {
    setLoading(true);
    try {
      await api.put(`/workout-plans/${planId}/${dayName}/${exerciseName}`, data);
      setUiMessage({ type: 'success', text: "Exercício atualizado!" });
      fetchPlans();
    } catch (e) { setUiMessage({ type: 'error', text: "Erro ao atualizar exercício." }); }
    finally { setLoading(false); }
  };

  const onAddExercise = async (planId, dayName, data) => {
    setLoading(true);
    try {
        const response = await api.post(`/workout-plans/${planId}/exercise`, { dayName, ...data });
        setUiMessage({ type: 'success', text: "Exercício adicionado!" });
        if (response.data.workoutPlan) setSelectedPlan(response.data.workoutPlan);
        fetchPlans();
    } catch (e) { setUiMessage({ type: 'error', text: "Erro ao adicionar exercício." }); }
    finally { setLoading(false); }
  };

  const onAddDay = async (planId, dayName) => {
    setLoading(true);
    try {
        await api.post(`/workout-plans/${planId}/day`, { name: dayName });
        setUiMessage({ type: 'success', text: "Novo dia adicionado!" });
        fetchPlans();
    } catch (e) { setUiMessage({ type: 'error', text: "Erro ao adicionar dia." }); }
    finally { setLoading(false); }
  };

const onDeleteDay = async (planId, dayName) => {
    setLoading(true);
    try {
        const token = localStorage.getItem('@IronSoul:token');
        await api.delete(`/workout-plans/${planId}/day/${dayName}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        setUiMessage({ type: 'success', text: "Dia removido do protocolo!" });
        fetchPlans();
    } catch (e) { 
        setUiMessage({ type: 'error', text: "Erro ao remover dia." }); 
    }
    finally { setLoading(false); }
};

  const onReorderDays = async (planId, index, direction) => {
    const currentPlan = plans.find(p => (p._id || p.id) === planId);
    if (!currentPlan) return;
    
    const newDays = [...currentPlan.days];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newDays[index], newDays[targetIndex]] = [newDays[targetIndex], newDays[index]];
    
    setLoading(true);
    try {
      await api.put(`/workout-plans/${planId}/reorder`, { daysOrder: newDays.map(d => d.name) });
      setUiMessage({ type: 'success', text: "Ordem redefinida!" });
      fetchPlans();
    } catch (e) { setUiMessage({ type: 'error', text: "Erro ao reordenar." }); }
    finally { setLoading(false); }
  };

  const stats = useMemo(() => {
    const maxWeight = plans.reduce((acc, plan) => {
        const dayMax = plan.days?.reduce((dAcc, d) => {
            const exerciseMax = d.exercises?.reduce((eAcc, ex) => Math.max(eAcc, Number(ex.weight) || 0), 0) || 0;
            return Math.max(dAcc, exerciseMax);
        }, 0) || 0;
        return Math.max(acc, dayMax);
    }, 0);
    return { maxWeight };
  }, [plans]);

  const formLogin = useForm({ resolver: zodResolver(loginSchema) });
  const formRegister = useForm({ resolver: zodResolver(registerSchema) });
  const formVerify = useForm({ resolver: zodResolver(verifySchema) });
  const formForgot = useForm({ resolver: zodResolver(forgotPasswordSchema) });
  const formReset = useForm({ resolver: zodResolver(resetPasswordSchema) });
  const formChangePassword = useForm({ resolver: zodResolver(changePasswordSchema), mode: 'onChange' });
  const formPlan = useForm({ resolver: zodResolver(planSchema), defaultValues: { name: '', days: [] } });

  const { fields: dayFields, append: appendDay, remove: removeDay } = useFieldArray({ control: formPlan.control, name: "days" });

  useEffect(() => {
    formLogin.reset(); formRegister.reset(); formVerify.reset(); formForgot.reset(); formReset.reset(); formChangePassword.reset();
    if (isAuthenticated && activeTab === 'dashboard') fetchPlans();
  }, [view, activeTab, isAuthenticated]);

  useEffect(() => {
    if (uiMessage.text) {
      const timer = setTimeout(() => setUiMessage({ type: '', text: '' }), 6000);
      return () => clearTimeout(timer);
    }
  }, [uiMessage]);

  const onLoginSubmit = async (data) => {
    setLoading(true);
    const result = await login(data);
    setLoading(false);
    if (!result.success) setUiMessage({ type: 'error', text: result.message });
  };

  const onRegisterSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/users/register', data);
      setTempEmail(data.email);
      setUiMessage({ type: 'success', text: "Avatar criado! Verifica teu e-mail." });
      setView('verify');
    } catch (e) { setUiMessage({ type: 'error', text: e.response?.data?.message || "Falha na conexão." }); } 
    finally { setLoading(false); }
  };

  const onVerifySubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/users/verify-email', { email: tempEmail, code: data.code });
      setUiMessage({ type: 'success', text: "E-mail validado! Faz o login." });
      setView('login');
    } catch (e) { setUiMessage({ type: 'error', text: e.response?.data?.message || "Código inválido." }); } 
    finally { setLoading(false); }
  };

  const onForgotSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/users/forgot-password', data);
      setTempEmail(data.email);
      setUiMessage({ type: 'success', text: "Código enviado!" });
      setView('resetPassword');
    } catch (e) { setUiMessage({ type: 'error', text: e.response?.data?.message || "E-mail não identificado." }); } 
    finally { setLoading(false); }
  };

  const onResetSubmit = async (data) => {
    if (!tempEmail) { setView('forgotPassword'); return; }
    setLoading(true);
    try {
      await api.post('/users/reset-password', { ...data, email: tempEmail });
      setUiMessage({ type: 'success', text: "Senha redefinida!" });
      if (isInternalReset) { setIsInternalReset(false); logout(); setView('landing'); } 
      else { setView('login'); }
    } catch (e) { setUiMessage({ type: 'error', text: e.response?.data?.message || "Erro no reset." }); } 
    finally { setLoading(false); }
  };

  const onChangePasswordSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/users/update-password', data);
      setUiMessage({ type: 'success', text: "Senha atualizada!" });
      formChangePassword.reset();
    } catch (e) { setUiMessage({ type: 'error', text: e.response?.data?.message || "Falha ao atualizar." }); } 
    finally { setLoading(false); }
  };

  const onPlanSubmit = async (data) => {
    setLoading(true);
    try {
        await api.post('/workout-plans', data);
        setUiMessage({ type: 'success', text: "Plano sincronizado!" });
        setIsCreatingPlan(false);
        formPlan.reset();
        fetchPlans();
    } catch (e) { setUiMessage({ type: 'error', text: e.response?.data?.message || "Erro ao salvar plano" }); } 
    finally { setLoading(false); }
  };

  const handleDeletePlan = async (planId) => {
    if (loading) return;
    setLoading(true);
    try {
      await api.delete(`/workout-plans/${planId}`);
      setUiMessage({ type: 'success', text: "Protocolo deletado da Arena." });
      setSelectedPlan(null);
      fetchPlans();
    } catch (e) { setUiMessage({ type: 'error', text: e.response?.data?.message || "Falha ao deletar plano." }); } 
    finally { setLoading(false); }
  };

  const handleDeleteExercise = async (planId, dayName, exerciseName) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await api.delete(`/workout-plans/${planId}/${dayName}/${exerciseName}`);
      setUiMessage({ type: 'success', text: "Exercício removido do protocolo." });
      if (response.data.workoutPlan) setSelectedPlan(response.data.workoutPlan);
      fetchPlans();
    } catch (e) { setUiMessage({ type: 'error', text: e.response?.data?.message || "Falha ao remover exercício." }); } 
    finally { setLoading(false); }
  };

  const renderView = () => {
    if (['forgotPassword', 'resetPassword', 'verify'].includes(view)) {
        const resetBack = () => { if (isInternalReset) { setIsInternalReset(false); setView('landing'); setIsProfileOpen(true); } else setView('landing'); };
        if (view === 'forgotPassword') return <AuthWrapper title="Recuperar" subtitle="Solicita o código de acesso." onSubmit={formForgot.handleSubmit(onForgotSubmit)} onBack={resetBack} uiMessage={uiMessage} loading={loading}><InputField label="Teu E-mail" type="email" icon={Mail} error={formForgot.formState.errors.email?.message} {...formForgot.register('email')} /><button type="submit" className={`w-full py-4 rounded-xl font-black italic text-black uppercase tracking-wider ${theme.colors.primaryBg} ${theme.colors.primaryHover} transition-all mt-2 disabled:opacity-50`}>Enviar Código</button></AuthWrapper>;
        if (view === 'resetPassword') return <AuthWrapper title="Nova Senha" subtitle="Define a tua nova credencial." onSubmit={formReset.handleSubmit(onResetSubmit)} onBack={resetBack} uiMessage={uiMessage} loading={loading}><InputField label="Código de 6 dígitos" type="text" maxLength={6} error={formReset.formState.errors.code?.message} {...formReset.register('code')} /><InputField label="Nova Senha" type="password" icon={Lock} error={formReset.formState.errors.password?.message} {...formReset.register('password')} /><button type="submit" className={`w-full py-4 rounded-xl font-black italic text-black uppercase tracking-wider ${theme.colors.primaryBg} ${theme.colors.primaryHover} transition-all mt-2`}>Redefinir Senha</button></AuthWrapper>;
        if (view === 'verify') return <AuthWrapper title="Validar E-mail" subtitle={`Código enviado para ${tempEmail}`} onSubmit={formVerify.handleSubmit(onVerifySubmit)} onBack={resetBack} uiMessage={uiMessage} loading={loading}><InputField label="Código de 6 dígitos" type="text" maxLength={6} placeholder="000000" error={formVerify.formState.errors.code?.message} {...formVerify.register('code')} className="text-center text-3xl font-black tracking-[0.4em] w-full bg-black/40 border border-white/10 rounded-xl p-5 text-white outline-none focus:border-[#d4ff00]" /><button type="submit" className={`w-full py-4 rounded-xl font-black italic text-black uppercase tracking-wider ${theme.colors.primaryBg} ${theme.colors.primaryHover} transition-all mt-2`}>Verificar</button></AuthWrapper>;
    }

    if (isAuthenticated) {
      return (
        <div className={`min-h-screen ${theme.colors.background} text-white pb-24 md:pt-24 px-4 relative overflow-x-hidden`}>
          {!selectedPlan && activeTab === 'dashboard' && !isCreatingPlan && (
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
               <div className="absolute inset-0 bg-cover bg-center opacity-40 grayscale-[0.2]" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2000&auto=format&fit=crop')` }} />
               <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
            </div>
          )}

          <Navbar activeTab={activeTab} setActiveTab={setActiveTab} onOpenProfile={() => setIsProfileOpen(true)} />
          <ProfileSideMenu isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} user={user} logout={logout} securityContent={
            <div className="space-y-6 pt-2">
              <StatusMessage type={uiMessage.type} message={uiMessage.text} />
              <form onSubmit={formChangePassword.handleSubmit(onChangePasswordSubmit)} className="space-y-4">
                <InputField label="Senha Atual" type="password" icon={Lock} error={formChangePassword.formState.errors.oldPassword?.message} {...formChangePassword.register('oldPassword')} />
                <InputField label="Nova Senha" type="password" icon={ShieldCheck} error={formChangePassword.formState.errors.newPassword?.message} {...formChangePassword.register('newPassword')} />
                <button type="submit" className={`w-full py-4 rounded-xl font-black italic text-black uppercase text-[10px] tracking-widest ${theme.colors.primaryBg} ${theme.colors.primaryHover} transition-all shadow-lg active:scale-95`}>{loading ? "Sincronizando..." : "Trocar Senha"}</button>
              </form>
              
              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                <span className="relative bg-[#111111] px-2 text-[8px] uppercase font-black text-gray-700 tracking-widest italic">ou</span>
              </div>

              <button onClick={() => { setTempEmail(user?.email); setIsInternalReset(true); setView('forgotPassword'); setIsProfileOpen(false); }} className="w-full py-4 rounded-xl font-bold text-white border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.2em] active:scale-95"><KeyRound size={14} /> Redefinição via E-mail</button>
            </div>
          } />

          <main className="max-w-7xl mx-auto py-8 relative z-10">
              <StatusMessage type={uiMessage.type} message={uiMessage.text} />
              {activeTab === 'dashboard' ? (
                <div className="space-y-8">
                    {selectedPlan ? (
                        <PlanDetailsView 
                          plan={selectedPlan} 
                          onBack={() => setSelectedPlan(null)} 
                          completedExercises={completedExercises}
                          toggleCheck={toggleCheck}
                          onDeletePlan={handleDeletePlan}
                          onDeleteExercise={handleDeleteExercise}
                          onUpdatePlanName={onUpdatePlanName}
                          onUpdateDayName={onUpdateDayName}
                          onUpdateExercise={onUpdateExercise}
                          onAddExercise={onAddExercise}
                          onReorderDays={onReorderDays}
                          onAddDay={onAddDay}
                          onDeleteDay={onDeleteDay}
                        />
                    ) : !isCreatingPlan ? (
                        <div className="space-y-10 animate-in fade-in duration-700">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                                <div className="space-y-1"><div className="flex items-center gap-2 text-[#d4ff00] font-black italic uppercase tracking-tighter text-4xl leading-none">IRON SOUL</div><div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest"><span className="flex items-center gap-1.5"><Activity size={12} className="text-[#d4ff00]"/> STATUS: PROTOCOLO ATIVO</span><span>•</span><span>{new Date().toLocaleDateString('pt-BR')}</span></div></div>
                                <div className="flex items-center gap-3"><button onClick={() => setIsCreatingPlan(true)} className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-[#d4ff00] transition-all shadow-xl active:scale-95"><Plus size={16} strokeWidth={3} /> Criar Protocolo</button></div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-2 gap-4 px-2 max-w-2xl"><MetricCard icon={Trophy} label="Max Carga" value={`${stats.maxWeight}kg`} colorClass="text-[#d4ff00]" /><MetricCard icon={Flame} label="Planos" value={plans.length} /></div>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                <div className="lg:col-span-2 space-y-6">
                                    {plans.length === 0 ? (<div className="bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[2.5rem] min-h-[400px] flex flex-col items-center justify-center p-12 text-center space-y-6 backdrop-blur-sm"><div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-gray-700"><Zap size={32} /></div><div className="space-y-2"><h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">Sem Protocolos</h2><p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] max-w-xs">Define a tua primeira arquitetura de força no botão acima.</p></div></div>) : (
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {plans.map((plan, idx) => {
                                                const DecorativeIcon = idx % 2 === 0 ? Dumbbell : Zap;
                                                return (
                                                  <div key={plan._id || plan.id || `temp-${idx}`} onClick={() => setSelectedPlan(plan)} className="group relative p-8 rounded-[2.5rem] border border-[#d4ff00]/10 hover:border-[#d4ff00]/50 transition-all shadow-xl overflow-hidden cursor-pointer active:scale-95 min-h-[220px] flex flex-col justify-end animate-in fade-in zoom-in duration-500">
                                                      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#1a1c00] group-hover:via-[#1a1c00] transition-colors duration-500" />
                                                      <div className="absolute -right-8 -top-8 text-[#d4ff00]/[0.04] group-hover:text-[#d4ff00]/[0.08] transition-all duration-700 transform rotate-12">
                                                        <DecorativeIcon size={240} strokeWidth={1} />
                                                      </div>
                                                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#d4ff00]/20 group-hover:bg-[#d4ff00] transition-all duration-300" />
                                                      <div className="space-y-4 relative z-10">
                                                        <div className="space-y-1">
                                                          <div className="w-12 h-1.5 bg-[#d4ff00] rounded-full mb-4 shadow-[0_0_15px_rgba(212,255,0,0.4)]"></div>
                                                          <h3 className="text-3xl font-black italic uppercase tracking-tighter text-white leading-none group-hover:text-[#d4ff00] transition-colors">{plan.name}</h3>
                                                        </div>
                                                        <div className="flex items-center justify-between pt-2">
                                                          <div className="flex flex-col">
                                                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Arquitetura</span>
                                                            <span className="text-xs font-bold text-white">{plan.daysCount} DIAS DE FORÇA</span>
                                                          </div>
                                                          <div className="w-12 h-12 rounded-2xl bg-black border border-white/5 flex items-center justify-center text-gray-500 group-hover:text-black group-hover:bg-[#d4ff00] transition-all shadow-lg">
                                                            <ChevronRight size={24} strokeWidth={3} />
                                                          </div>
                                                        </div>
                                                      </div>
                                                  </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-6"><div className="bg-white/[0.03] backdrop-blur-md border border-white/5 rounded-[2.5rem] p-8 h-full space-y-8 shadow-2xl"><div className="flex items-center gap-3"><Clock className="text-[#d4ff00]" size={18} /><h3 className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Sessões Recentes</h3></div><div className="flex flex-col items-center justify-center text-center py-12 space-y-4"><div className="p-4 bg-white/5 rounded-full"><Activity size={24} className="text-gray-800" /></div><p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest leading-relaxed">A aguardar logs de treino.</p></div></div></div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center gap-4"><button onClick={() => setIsCreatingPlan(false)} className="text-gray-500 hover:text-white transition-colors"><ArrowLeft size={24} /></button><h1 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-none">Novo Protocolo</h1></div>
                            <form onSubmit={formPlan.handleSubmit(onPlanSubmit)} className="space-y-6">
                                <div className={`p-8 rounded-[2rem] ${theme.colors.surfaceLight} border ${theme.colors.border} space-y-6 shadow-xl`}>
                                    <div className="grid md:grid-cols-1 gap-6"><InputField label="Nome do Plano" placeholder="Ex: PPL Elite" {...formPlan.register('name')} error={formPlan.formState.errors.name?.message} /></div>
                                    <div className="space-y-6 pt-4 border-t border-white/5"><div className="flex items-center justify-between"><h2 className="text-lg font-black italic uppercase tracking-tight">Arquitetura de Dias</h2><button type="button" onClick={() => appendDay({ name: '', exercises: [] })} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-[#d4ff00]"><Plus size={14} /> Adicionar Dia</button></div><div className="space-y-4">{dayFields.map((day, index) => (<DayAccordion key={day.id} dayIndex={index} register={formPlan.register} removeDay={removeDay} control={formPlan.control} />))}</div></div>
                                    <button disabled={loading} type="submit" className={`w-full py-5 rounded-2xl font-black italic text-black uppercase tracking-widest ${theme.colors.primaryBg} ${theme.colors.primaryHover} transition-all shadow-[0_0_50px_rgba(212,255,0,0.2)] flex items-center justify-center gap-3 active:scale-95`}><Save size={20} /> {loading ? "Sincronizando..." : "Sincronizar Protocolo"}</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
              ) : (
                <div className={`p-10 rounded-[3rem] ${theme.colors.surfaceLight} border ${theme.colors.border} text-center space-y-8 shadow-2xl relative overflow-hidden animate-in zoom-in duration-500 min-h-[450px] flex flex-col items-center justify-center`}><div className="absolute inset-0 z-0 bg-cover bg-center opacity-5 grayscale" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=1200')` }}></div><div className="relative z-10 w-20 h-20 rounded-2xl bg-[#d4ff00]/10 flex items-center justify-center shadow-inner"><Zap className={theme.colors.primary} size={48} fill="currentColor" /></div><div className="relative z-10 space-y-2"><h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">Histórico de Força</h1><p className="text-gray-500 font-bold uppercase text-xs tracking-[0.3em]">Protocolos Finalizados</p></div></div>
              )}
          </main>
        </div>
      );
    }

    switch(view) {
      case 'login':
        return (<AuthWrapper title="Login Arena" subtitle="Conecta tuas credenciais de elite." onSubmit={formLogin.handleSubmit(onLoginSubmit)} onBack={() => setView('landing')} uiMessage={uiMessage} loading={loading}><InputField label="E-mail" type="email" icon={Mail} error={formLogin.formState.errors.email?.message} {...formLogin.register('email')} /><div className="space-y-1"><InputField label="Senha" type="password" icon={Lock} error={formLogin.formState.errors.password?.message} {...formLogin.register('password')} /><div className="text-right"><button type="button" onClick={() => setView('forgotPassword')} className="text-[10px] text-gray-600 font-bold uppercase tracking-widest hover:text-[#d4ff00] transition-colors">Esqueci a senha</button></div></div><div className="space-y-4 pt-2"><button disabled={loading} type="submit" className={`w-full py-4 rounded-xl font-black italic text-black uppercase tracking-wider ${theme.colors.primaryBg} ${theme.colors.primaryHover} transition-all disabled:opacity-50`}>Entrar</button>
        
        <div className="relative flex items-center justify-center py-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
          <span className="relative bg-[#111111] px-2 text-[8px] uppercase font-black text-gray-700 tracking-widest italic">ou</span>
        </div>

        <button type="button" onClick={() => setView('register')} className="w-full py-4 rounded-xl font-bold text-white border-2 border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"><UserPlus size={16} /> Criar Novo Avatar</button></div></AuthWrapper>);
      case 'register':
        return (<AuthWrapper title="Novo Avatar" subtitle="Junta-te à infraestrutura de força." onSubmit={formRegister.handleSubmit(onRegisterSubmit)} onBack={() => setView('landing')} uiMessage={uiMessage} loading={loading}><InputField label="Nome Completo" type="text" icon={User} error={formRegister.formState.errors.name?.message} {...formRegister.register('name')} /><InputField label="E-mail" type="email" icon={Mail} error={formRegister.formState.errors.email?.message} {...formRegister.register('email')} /><InputField label="Senha" type="password" icon={Lock} error={formRegister.formState.errors.password?.message} {...formRegister.register('password')} /><button disabled={loading} type="submit" className={`w-full py-4 rounded-xl font-black italic text-black uppercase tracking-wider ${theme.colors.primaryBg} ${theme.colors.primaryHover} transition-all mt-2`}>Registrar</button></AuthWrapper>);
      default: return <LandingPage onStart={(mode) => setView(mode)} />;
    }
  };

  return (<div className="font-sans antialiased selection:bg-[#d4ff00] selection:text-black">{renderView()}</div>);
}

export default function App() {
  return (
    <AuthProvider>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .no-spinners::-webkit-inner-spin-button, .no-spinners::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        .no-spinners { -moz-appearance: textfield; }
        input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 1000px #0a0a0a inset !important;
            -webkit-text-fill-color: white !important;
            transition: background-color 5000s ease-in-out 0s;
        }
        input.day-name-input:-webkit-autofill { -webkit-text-fill-color: #d4ff00 !important; }
      `}</style>
      <MainContent />
    </AuthProvider>
  );
}