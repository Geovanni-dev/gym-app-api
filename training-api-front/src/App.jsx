import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import MetricsGrid from './components/MetricsGrid';
import MetricsGridAuto from './components/MetricsGridAuto';
import { useScrollToInput } from './hooks/useScrollToInput';
import {
  Dumbbell,
  LayoutDashboard,
  History as HistoryIcon,
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
  ArrowDown,
  Search,
  Sword,
  ClipboardList,
  Heart,
  Star,
  Crown,
  Anchor,
  Gem,
} from 'lucide-react';

// IMPORTS DOS ARQUIVOS SEPARADOS
import api from './services/api';
import {
  loginSchema,
  registerSchema,
  verifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  planSchema,
  generateWorkoutSchema,
} from './schemas';
import { theme } from './utils/theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  StatusMessage,
  InputField,
  AuthWrapper,
  LandingPage,
  MetricCard,
  Navbar,
  ProfileSideMenu,
  DayAccordion,
  PlanDetailsView,
} from './components';

// --- MAIN CONTENT ---
function MainContent() {
  const { isAuthenticated, login, logout, user } = useAuth();
  
  // PERSISTÊNCIA: carregar estado salvo do localStorage
  const [view, setView] = useState(() => {
    const saved = localStorage.getItem('@IronSoul:view');
    return saved || 'landing';
  });
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('@IronSoul:activeTab');
    return saved || 'dashboard';
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [tempEmail, setTempEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [uiMessage, setUiMessage] = useState({ type: '', text: '' });
  const [isInternalReset, setIsInternalReset] = useState(false);

  const [plans, setPlans] = useState([]);
  const [generatedWorkouts, setGeneratedWorkouts] = useState([]);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(() => {
    const saved = localStorage.getItem('@IronSoul:selectedPlan');
    return saved ? JSON.parse(saved) : null;
  });
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);

  const [history, setHistory] = useState([]);
  const [selectedExerciseHistory, setSelectedExerciseHistory] = useState(null);

  const [isPRSearchOpen, setIsPRSearchOpen] = useState(false);
  const [prSearchQuery, setPRSearchQuery] = useState('');
  const [prSearchResult, setPRSearchResult] = useState(null);
  const [searchingPR, setSearchingPR] = useState(false);

  const [completedExercises, setCompletedExercises] = useState(() => {
    const saved = localStorage.getItem('@IronSoul:completed');
    return saved ? JSON.parse(saved) : {};
  });

  // STATE PARA CONTROLAR O OBJETIVO SELECIONADO NO GERADOR
  const [selectedGoal, setSelectedGoal] = useState('hipertrofia');
  
  // LIMITE DE EXIBIÇÃO: Manuais (Plans) e Automáticos
  const [visiblePlans, setVisiblePlans] = useState(6);
  const [visibleWorkouts, setVisibleWorkouts] = useState(6);

  // ESTADOS PARA LIMPEZA DE HISTÓRICO
  const [isHistoryResetOpen, setIsHistoryResetOpen] = useState(false);
  const [historyConfirmInput, setHistoryConfirmInput] = useState('');

  // PERSISTÊNCIA: salvar estados no localStorage quando mudarem
  useEffect(() => {
    localStorage.setItem('@IronSoul:view', view);
  }, [view]);
  
  useEffect(() => {
    localStorage.setItem('@IronSoul:activeTab', activeTab);
  }, [activeTab]);
  
  useEffect(() => {
    if (selectedPlan) {
      localStorage.setItem('@IronSoul:selectedPlan', JSON.stringify(selectedPlan));
    } else {
      localStorage.removeItem('@IronSoul:selectedPlan');
    }
  }, [selectedPlan]);

  useEffect(() => {
    localStorage.setItem('@IronSoul:completed', JSON.stringify(completedExercises));
  }, [completedExercises]);

  useEffect(() => {
    const checkExpiry = () => {
      const now = Date.now();
      const expiryTime = 5 * 60 * 60 * 1000;
      let hasExpired = false;
      const updatedState = { ...completedExercises };
      updatedState &&
        Object.keys(updatedState).forEach((key) => {
          if (updatedState[key].timestamp && now - updatedState[key].timestamp > expiryTime) {
            delete updatedState[key];
            hasExpired = true;
          }
        });
      if (hasExpired) setCompletedExercises(updatedState);
    };
    const interval = setInterval(checkExpiry, 60000);
    return () => clearInterval(interval);
  }, [completedExercises]);

  // CORREÇÃO 3: Impede o scroll do fundo quando o modal do gerador estiver aberto
  useEffect(() => {
    if (isGeneratingCustom) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isGeneratingCustom]);

  const toggleCheck = (key) => {
    setCompletedExercises((prev) => {
      if (prev[key]) {
        const { [key]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: { completed: true, timestamp: Date.now() } };
    });
  };

  // Função para limpar exercícios de um dia específico após finalizar treino
  const onClearDayExercises = (planId, dayIdx) => {
    setCompletedExercises((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        if (key.startsWith(`${planId}-${dayIdx}-`)) {
          delete newState[key];
        }
      });
      return newState;
    });
  };

  const fetchPlans = async () => {
    try {
      const response = await api.get('/workout-plans');
      const formattedPlans = response.data.map((p) => ({
        ...p,
        daysCount: p.days?.length || 0,
      }));
      setPlans(formattedPlans);
      if (
        selectedPlan &&
        activeTab === 'dashboard' &&
        formattedPlans.some((p) => (p._id || p.id) === (selectedPlan._id || selectedPlan.id))
      ) {
        const updated = formattedPlans.find(
          (p) => (p._id || p.id) === (selectedPlan._id || selectedPlan.id)
        );
        if (updated) setSelectedPlan(updated);
      }
    } catch (e) {
      console.error('Erro ao carregar planos', e);
    }
  };

  const fetchGeneratedWorkouts = async () => {
    try {
      const response = await api.get('/workouts/my-workouts');
      const formatted = response.data.map((w) => ({
        ...w,
        name: `PROTOCOLO ${w.goal?.toUpperCase() || 'AUTO'}`,
        daysCount: w.days || 0,
        days:
          w.split?.map((s) => ({
            name: s.day,
            exercises:
              s.exercises?.map((ex) => ({
                name: typeof ex === 'string' ? ex : ex.name || ex.exercise || 'Exercício',
                sets: w.sets || 3,
                reps: w.reps || '8-12',
                weight: ex.weight || 0,
              })) || [],
          })) || [],
      }));
      setGeneratedWorkouts(formatted);
      if (
        selectedPlan &&
        activeTab === 'generator' &&
        formatted.some((w) => (w._id || w.id) === (selectedPlan._id || selectedPlan.id))
      ) {
        const updated = formatted.find(
          (w) => (w._id || w.id) === (selectedPlan._id || selectedPlan.id)
        );
        if (updated) setSelectedPlan(updated);
      }
    } catch (e) {
      console.error('Erro ao carregar treinos gerados', e);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await api.get('/workouts/history');
      const historyData = response.data.data || response.data || [];
      setHistory(historyData);
    } catch (e) {
      console.error('Erro ao carregar histórico', e);
      setHistory([]);
    }
  };

  const handleClearHistory = async () => {
    if (historyConfirmInput !== 'CONFIRM') return;
    setLoading(true);
    try {
      await api.delete('/workouts/history', { data: { confirm: 'CONFIRM' } });
      setHistory([]);
      setIsHistoryResetOpen(false);
      setHistoryConfirmInput('');
      setUiMessage({ type: 'success', text: 'Histórico limpo com sucesso!' });
    } catch (e) {
      setUiMessage({ type: 'error', text: 'Falha ao limpar histórico.' });
    } finally {
      setLoading(false);
    }
  };

  const onUpdatePlanName = async (planId, newName) => {
    setLoading(true);
    try {
      await api.put(`/workout-plans/${planId}/name`, { name: newName });
      fetchPlans();
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const onUpdateDayName = async (planId, oldDayName, newDayName) => {
    setLoading(true);
    try {
      await api.put(`/workout-plans/${planId}/day/${oldDayName}`, { name: newDayName });
      fetchPlans();
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const onUpdateExercise = async (planId, dayName, exerciseName, data, isGenerated = false) => {
    setLoading(true);
    try {
      let endpoint;
      if (isGenerated) {
        endpoint = `/workouts/update-pr`;
        await api.put(endpoint, {
          workoutId: planId,
          exerciseName: exerciseName,
          newPR: Number(data.weight),
        });
      } else {
        endpoint = `/workout-plans/${planId}/${dayName}/${encodeURIComponent(exerciseName)}`;
        await api.put(endpoint, data);
      }
      fetchPlans();
      fetchGeneratedWorkouts();
    } catch (e) {
      console.error('Erro detalhado:', e.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const onAddExercise = async (planId, dayName, data) => {
    setLoading(true);
    try {
      const response = await api.post(`/workout-plans/${planId}/exercise`, { dayName, ...data });
      if (response.data.workoutPlan) setSelectedPlan(response.data.workoutPlan);
      fetchPlans();
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const onAddDay = async (planId, dayName) => {
    setLoading(true);
    try {
      await api.post(`/workout-plans/${planId}/day`, { name: dayName });
      fetchPlans();
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const onDeleteDay = async (planId, dayName) => {
    setLoading(true);
    try {
      await api.delete(`/workout-plans/${planId}/day/${dayName}`);
      fetchPlans();
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const onReorderDays = async (planId, index, direction) => {
    const currentPlan = plans.find((p) => (p._id || p.id) === planId);
    if (!currentPlan) return;
    const newDays = [...currentPlan.days];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newDays[index], newDays[targetIndex]] = [newDays[targetIndex], newDays[index]];
    setLoading(true);
    try {
      await api.put(`/workout-plans/${planId}/reorder`, { daysOrder: newDays.map((d) => d.name) });
      fetchPlans();
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (loading) return;
    setLoading(true);
    try {
      await api.delete(`/workout-plans/${planId}`);
      setSelectedPlan(null);
      fetchPlans();
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGeneratedWorkout = async (workoutId) => {
    if (loading) return;
    setLoading(true);
    try {
      await api.delete(`/workouts/${workoutId}`);
      setSelectedPlan(null);
      fetchGeneratedWorkouts();
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const onFinishWorkout = async (plan) => {
    setLoading(true);
    try {
      const planId = plan._id || plan.id;
      const entriesToLog = [];
      plan.days.forEach((day, dIdx) => {
        day.exercises.forEach((ex, eIdx) => {
          const key = `${planId}-${dIdx}-${eIdx}`;
          if (completedExercises[key]) {
          entriesToLog.push({
  name: ex.name,
  reps: Number(ex.reps.split('-')[0]) || 0,
  weight: Number(ex.weight) || 0,
  // ANTES: workoutName: day.name
  // AGORA: Nome do Plano + Nome do Dia (Ex: "Protocolo Hipertrofia - Push")
  workoutName: `${plan.name} - ${day.name}`, 
});
          }
        });
      });
      if (entriesToLog.length === 0) return;
      await api.post('/workouts/log', { exercises: entriesToLog });
      const updatedChecks = { ...completedExercises };
      Object.keys(updatedChecks).forEach((k) => {
        if (k.startsWith(`${planId}-`)) delete updatedChecks[k];
      });
      setCompletedExercises(updatedChecks);
      fetchHistory();
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => {
    const historyArray = Array.isArray(history) ? history : [];
    const maxWeight = historyArray.reduce((acc, log) => Math.max(acc, Number(log.weight) || 0), 0);

    let sessionVolume = 0;
    let completedCount = 0;
    const allPlans = [...plans, ...generatedWorkouts];

    Object.keys(completedExercises).forEach((key) => {
      const [pId, dIdx, eIdx] = key.split('-');
      const plan = allPlans.find((p) => (p._id || p.id) === pId);
      if (plan && plan.days?.[dIdx]?.exercises?.[eIdx]) {
        const ex = plan.days[dIdx].exercises[eIdx];
        const reps = parseInt(ex.reps) || 0;
        const sets = Number(ex.sets) || 1;
        const weight = Number(ex.weight) || 0;
        sessionVolume += weight * reps * sets;
        completedCount++;
      }
    });

    return { maxWeight, sessionVolume, completedCount };
  }, [history, completedExercises, plans, generatedWorkouts]);

  const handleSearchPR = async (e) => {
    e.preventDefault();
    if (!prSearchQuery.trim()) return;
    setSearchingPR(true);
    try {
      const response = await api.get('/workouts/pr', {
        params: { exercise: prSearchQuery.trim() },
      });
      const pr = response.data.personalRecord || response.data.weight;
      setPRSearchResult(pr !== undefined && pr !== null ? `${pr}KG` : 'N/A');
    } catch (e) {
      setPRSearchResult('N/A');
    } finally {
      setSearchingPR(false);
    }
  };

  const formLogin = useForm({ resolver: zodResolver(loginSchema) });
  const formRegister = useForm({ resolver: zodResolver(registerSchema) });
  const formVerify = useForm({ resolver: zodResolver(verifySchema) });
  const formForgot = useForm({ resolver: zodResolver(forgotPasswordSchema) });
  const formReset = useForm({ resolver: zodResolver(resetPasswordSchema) });
  const formChangePassword = useForm({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
  });
  const formPlan = useForm({
    resolver: zodResolver(planSchema),
    defaultValues: { name: '', days: [] },
  });

  const formGenerate = useForm({
    resolver: zodResolver(generateWorkoutSchema),
    defaultValues: { goal: 'hipertrofia', days: 3 },
  });

  const {
    fields: dayFields,
    append: appendDay,
    remove: removeDay,
  } = useFieldArray({ control: formPlan.control, name: 'days' });

  useEffect(() => {
    setSelectedPlan(null);
    setIsCreatingPlan(false);
    setIsGeneratingCustom(false);
    setSelectedGoal('hipertrofia');
    formLogin.reset();
    formRegister.reset();
    formVerify.reset();
    formForgot.reset();
    formReset.reset();
    formChangePassword.reset();
    if (isAuthenticated) {
      fetchPlans();
      fetchGeneratedWorkouts();
      fetchHistory();
    }
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
      setUiMessage({ type: 'success', text: 'Conta criada! Verifica seu e-mail.' });
      setView('verify');
    } catch (e) {
      setUiMessage({ type: 'error', text: e.response?.data?.message || 'Falha na conexão.' });
    } finally {
      setLoading(false);
    }
  };

  const onVerifySubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/users/verify-email', { email: tempEmail, code: data.code });
      setUiMessage({ type: 'success', text: 'E-mail validado! Faz o login.' });
      setView('login');
    } catch (e) {
      setUiMessage({ type: 'error', text: e.response?.data?.message || 'Código inválido.' });
    } finally {
      setLoading(false);
    }
  };

  const onForgotSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/users/forgot-password', data);
      setTempEmail(data.email);
      setUiMessage({ type: 'success', text: 'Código enviado!' });
      setView('resetPassword');
    } catch (e) {
      setUiMessage({
        type: 'error',
        text: e.response?.data?.message || 'E-mail não identificado.',
      });
    } finally {
      setLoading(false);
    }
  };

  const onResetSubmit = async (data) => {
    if (!tempEmail) {
      setView('forgotPassword');
      return;
    }
    setLoading(true);
    try {
      await api.post('/users/reset-password', { ...data, email: tempEmail });
      setUiMessage({ type: 'success', text: 'Senha redefinida!' });
      if (isInternalReset) {
        setIsInternalReset(false);
        logout();
        setView('landing');
      } else {
        setView('login');
      }
    } catch (e) {
      setUiMessage({ type: 'error', text: e.response?.data?.message || 'Erro no reset.' });
    } finally {
      setLoading(false);
    }
  };

  const onChangePasswordSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/users/update-password', data);
      setUiMessage({ type: 'success', text: 'Senha atualizada!' });
      formChangePassword.reset();
    } catch (e) {
      setUiMessage({ type: 'error', text: e.response?.data?.message || 'Falha ao atualizar.' });
    } finally {
      setLoading(false);
    }
  };

  const onPlanSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/workout-plans', data);
      setIsCreatingPlan(false);
      formPlan.reset();
      fetchPlans();
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  // FUNÇÃO ONGENERATESUBMIT CORRIGIDA - USA O STATE selectedGoal
  const onGenerateSubmit = async () => {
    console.log('=== onGenerateSubmit foi chamada ===');
    console.log('Goal selecionado:', selectedGoal);
    console.log('Days:', formGenerate.getValues('days'));
    setLoading(true);
    try {
      const response = await api.post('/workouts/generate', {
        goal: selectedGoal,
        days: Number(formGenerate.getValues('days')),
      });
      console.log('Resposta da API:', response.data);
      setIsGeneratingCustom(false);
      setTimeout(() => fetchGeneratedWorkouts(), 500);
    } catch (e) {
      console.error('ERRO na API:', e);
      console.error('Detalhes:', e.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExercise = async (planId, dayName, exerciseName) => {
    if (loading) return;
    setLoading(true);
    try {
      const response = await api.delete(
        `/workout-plans/${planId}/${dayName}/${encodeURIComponent(exerciseName)}`
      );
      if (response.data.workoutPlan) setSelectedPlan(response.data.workoutPlan);
      fetchPlans();
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const renderView = () => {
    if (['forgotPassword', 'resetPassword', 'verify'].includes(view)) {
      const resetBack = () => {
        if (isInternalReset) {
          setIsInternalReset(false);
          setView('landing');
          setIsProfileOpen(true);
        } else setView('landing');
      };
      if (view === 'forgotPassword')
        return (
          <AuthWrapper
            title="Recuperar"
            subtitle="Solicita o código de redefinição."
            onSubmit={formForgot.handleSubmit(onForgotSubmit)}
            onBack={resetBack}
            uiMessage={uiMessage}
            loading={loading}
          >
            <InputField
              label="Digite o seu E-mail"
              type="email"
              icon={Mail}
              error={formForgot.formState.errors.email?.message}
              {...formForgot.register('email')}
            />
            <button
              type="submit"
              className={`w-full py-4 rounded-xl font-black italic text-black uppercase tracking-wider ${theme.colors.primaryBg} ${theme.colors.primaryHover} transition-all mt-2 disabled:opacity-50`}
            >
              Enviar Código
            </button>
          </AuthWrapper>
        );
      if (view === 'resetPassword')
        return (
          <AuthWrapper
            title="Nova Senha"
            subtitle="Define a sua nova senha."
            onSubmit={formReset.handleSubmit(onResetSubmit)}
            onBack={resetBack}
            uiMessage={uiMessage}
            loading={loading}
          >
            <InputField
              label="Código de 6 dígitos"
              type="text"
              maxLength={6}
              error={formReset.formState.errors.code?.message}
              {...formReset.register('code')}
            />
            <InputField
              label="Nova Senha"
              type="password"
              icon={Lock}
              error={formReset.formState.errors.password?.message}
              {...formReset.register('password')}
            />
            <button
              type="submit"
              className={`w-full py-4 rounded-xl font-black italic text-black uppercase tracking-wider ${theme.colors.primaryBg} ${theme.colors.primaryHover} transition-all mt-2`}
            >
              Redefinir Senha
            </button>
          </AuthWrapper>
        );
      if (view === 'verify')
        return (
          <AuthWrapper
            title="Validar Conta"
            subtitle={`Código enviado para ${tempEmail}`}
            onSubmit={formVerify.handleSubmit(onVerifySubmit)}
            onBack={resetBack}
            uiMessage={uiMessage}
            loading={loading}
          >
            <InputField
              label="Código de 6 dígitos"
              type="text"
              maxLength={6}
              placeholder="000000"
              error={formVerify.formState.errors.code?.message}
              {...formVerify.register('code')}
              className="text-center text-3xl font-black tracking-[0.4em] w-full bg-black/40 border border-white/10 rounded-xl p-5 text-white outline-none focus:border-[#ff6600]"
            />
            <button
              type="submit"
              className={`w-full py-4 rounded-xl font-black italic text-black uppercase tracking-wider ${theme.colors.primaryBg} ${theme.colors.primaryHover} transition-all mt-2`}
            >
              Verificar
            </button>
          </AuthWrapper>
        );
    }

    if (isAuthenticated) {
      return (
        <div
          className={`min-h-screen ${theme.colors.background} text-white pb-24 md:pt-24 px-4 relative overflow-x-hidden`}
        >
          {!selectedPlan && activeTab === 'dashboard' && !isCreatingPlan && (
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-40 grayscale-[0.2]"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2000&auto=format&fit=crop')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
            </div>
          )}
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onOpenProfile={() => setIsProfileOpen(true)}
          />
          <ProfileSideMenu
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            user={user}
            logout={logout}
            securityContent={
              <div className="space-y-6 pt-2">
                <StatusMessage type={uiMessage.type} message={uiMessage.text} />
                <form
                  onSubmit={formChangePassword.handleSubmit(onChangePasswordSubmit)}
                  className="space-y-4"
                >
                  <InputField
                    label="Senha Atual"
                    type="password"
                    icon={Lock}
                    error={formChangePassword.formState.errors.oldPassword?.message}
                    {...formChangePassword.register('oldPassword')}
                  />
                  <InputField
                    label="Nova Senha"
                    type="password"
                    icon={ShieldCheck}
                    error={formChangePassword.formState.errors.newPassword?.message}
                    {...formChangePassword.register('newPassword')}
                  />
                  <button
                    type="submit"
                    className={`w-full py-4 rounded-xl font-black italic text-black uppercase text-[10px] tracking-widest ${theme.colors.primaryBg} ${theme.colors.primaryHover} transition-all shadow-lg active:scale-95`}
                  >
                    {loading ? 'Sincronizando...' : 'Trocar Senha'}
                  </button>
                </form>
                <div className="relative flex items-center justify-center py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                  </div>
                  <span className="relative bg-[#111111] px-2 text-[8px] uppercase font-black text-gray-700 tracking-widest italic">
                    ou
                  </span>
                </div>
                <button
                  onClick={() => {
                    setTempEmail(user?.email);
                    setIsInternalReset(true);
                    setView('forgotPassword');
                    setIsProfileOpen(false);
                  }}
                  className="w-full py-4 rounded-xl font-bold text-white border border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-[9px] uppercase tracking-[0.2em] active:scale-95"
                >
                  <KeyRound size={14} /> Redefinição via E-mail
                </button>
              </div>
            }
          />

          {isPRSearchOpen && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
              <div className="bg-[#111111] border border-white/5 p-8 rounded-[2rem] w-full max-w-md space-y-6 shadow-2xl relative">
                <button
                  onClick={() => {
                    setIsPRSearchOpen(false);
                    setPRSearchResult(null);
                    setPRSearchQuery('');
                  }}
                  className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-[#ff6600]/10 text-[#ff6600] rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <Search size={24} />
                  </div>
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                    Scanner de Recorde
                  </h3>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                    Busca o PR de qualquer exercício
                  </p>
                </div>
                <form onSubmit={handleSearchPR} className="space-y-4">
                  <div className="relative">
                    <input
                      autoFocus
                      className="w-full bg-black border border-white/10 rounded-xl p-4 text-white uppercase font-bold text-sm outline-none focus:border-[#ff6600] pr-12"
                      placeholder="NOME DO EXERCÍCIO"
                      value={prSearchQuery}
                      onChange={(e) => setPRSearchQuery(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#ff6600]"
                    >
                      {searchingPR ? (
                        <div className="animate-spin h-5 w-5 border-2 border-[#ff6600] border-t-transparent rounded-full" />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                    </button>
                  </div>
                </form>
                {prSearchResult !== null && (
                  <div className="bg-white/[0.02] border border-[#ff6600]/20 rounded-2xl p-6 text-center animate-in zoom-in-95 duration-200">
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest mb-1">
                      RECORD PESSOAL (MAX CARGA)
                    </p>
                    <p className="text-5xl font-black italic text-[#ff6600] tracking-tighter">
                      {typeof prSearchResult === 'number' ? `${prSearchResult}KG` : prSearchResult}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <main className="max-w-7xl mx-auto pt-28 pb-8 md:pt-8 relative z-10 overflow-y-auto">
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
                    onFinishWorkout={onFinishWorkout}
                    onClearDayExercises={onClearDayExercises}
                    onForceRefresh={async () => { 

  await fetchPlans();
  await fetchGeneratedWorkouts();
  await fetchHistory();
  
  // Atualiza o plano selecionado se existir
  if (selectedPlan) {
    const planId = selectedPlan._id || selectedPlan.id;
    const isGenerated = activeTab === 'generator';
    
    let updatedPlan;
    if (isGenerated) {
      updatedPlan = generatedWorkouts.find(p => (p._id || p.id) === planId);
    } else {
      updatedPlan = plans.find(p => (p._id || p.id) === planId);
    }
    
    if (updatedPlan) {
      setSelectedPlan(updatedPlan);
    }
  }
}}
                    />
                ) : !isCreatingPlan ? (
                  <div className="space-y-10 animate-in fade-in duration-700">
                    {/* Header personalizado para planos de treino manual */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                      <div className="space-y-1 -mt-2">
                        <div className="text-[#ff6600] font-black italic uppercase tracking-tighter text-4xl leading-none">
                          PLANOS <br /> DE TREINO
                        </div>
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.4em]">
                          Crie e gerencie seus treinos manuais
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setIsCreatingPlan(true)}
                          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-[#ff6600] transition-all shadow-xl active:scale-95"
                        >
                          <Plus size={16} strokeWidth={3} /> Criar treino
                        </button>
                      </div>
                    </div>

                    <MetricsGrid
                      stats={stats}
                      plans={plans}
                      generatedWorkouts={generatedWorkouts}
                      setIsPRSearchOpen={setIsPRSearchOpen}
                    />

                    <div className="space-y-6">
                        {plans.length === 0 ? (
                          <div className="bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[2.5rem] min-h-[400px] flex flex-col items-center justify-center p-12 text-center space-y-6 backdrop-blur-sm">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-gray-700">
                              <Zap size={32} />
                            </div>
                            <div className="space-y-2">
                              <h2 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                                Sem Planos de treino
                              </h2>
                              <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em] max-w-xs"></p>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full px-2">
                              {plans.slice(0, visiblePlans).map((plan, idx) => {
                                const decorativeIcons = [Dumbbell, Zap, Flame, Heart, Star, Crown, Anchor, Gem];
                                const DecorativeIcon = decorativeIcons[idx % decorativeIcons.length];
                                return (
                                  <div
                                    key={plan._id || plan.id || `temp-${idx}`}
                                    onClick={() => setSelectedPlan(plan)}
                                    className="group relative p-8 rounded-[2.5rem] border border-[#ff6600]/10 hover:border-[#ff6600]/50 transition-all shadow-xl overflow-hidden cursor-pointer active:scale-95 min-h-[220px] flex flex-col justify-end animate-in fade-in zoom-in duration-500 w-full"
                                  >
                                    <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a0a00] to-[#2a1000] group-hover:via-[#1a1c00] transition-colors duration-500" />
                                    <div className="absolute -right-8 -top-8 text-[#ff6600]/[0.04] group-hover:text-[#ff6600]/[0.08] transition-all duration-700 transform rotate-12">
                                      <DecorativeIcon size={240} strokeWidth={1} />
                                    </div>
                                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#ff6600]/20 group-hover:bg-[#ff6600] transition-all duration-300" />
                                    <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#ff6600] shadow-[0_0_15px_#ff6600] transition-all duration-700 group-hover:w-full" />
                                    <div className="space-y-4 relative z-10">
                                      <div className="space-y-1">
                                        <div className="w-12 h-1.5 bg-[#ff6600] rounded-full mb-4 shadow-[0_0_15px_rgba(212,255,0,0.4)]"></div>
                                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none group-hover:text-[#ff6600] transition-colors">
                                          {plan.name}
                                        </h3>
                                      </div>
                                      <div className="flex items-center justify-between pt-2">
                                        <div className="flex flex-col">
                                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                            Arquitetura
                                          </span>
                                          <span className="text-xs font-bold text-white">
                                            {plan.daysCount} DIAS DE FORÇA
                                          </span>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-black border border-white/5 flex items-center justify-center text-gray-500 group-hover:text-black group-hover:bg-[#ff6600] transition-all shadow-lg">
                                          <ChevronRight size={24} strokeWidth={3} />
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                            
                            {plans.length > 6 && (
                              <div className="flex justify-center mt-6">
                                <div
                                  onClick={() => setVisiblePlans(visiblePlans === 6 ? plans.length : 6)}
                                  className="text-[#ff6600] hover:text-[#ff5500] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
                                      {visiblePlans === 6 ? `Exibir mais (${plans.length - 6})` : 'Exibir menos'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setIsCreatingPlan(false)}
                        className="text-gray-500 hover:text-white transition-colors"
                      >
                        <ArrowLeft size={24} />
                      </button>
                    </div>
                    <div className="flex justify-center">
                      <form
                        onSubmit={formPlan.handleSubmit(onPlanSubmit)}
                        className="space-y-6 w-full max-w-2xl"
                      >
                        <div
                          className={`p-8 rounded-[2rem] ${theme.colors.surfaceLight} border ${theme.colors.border} space-y-6 shadow-xl`}
                        >
                          <div className="text-center space-y-2">
                            <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter text-white">
                              CRIE UM PLANO DE TREINO
                            </h3>
                            <p className="text-gray-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                              ADICIONE DIAS E EXERCÍCIOS NO PLANO
                            </p>
                          </div>

                          <div className="grid md:grid-cols-1 gap-6">
                            <InputField
                              label="NOME DO PLANO"
                              placeholder="Ex: PPL UPPER LOWER"
                              {...formPlan.register('name')}
                              error={formPlan.formState.errors.name?.message}
                            />
                          </div>

                          <div className="space-y-6 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between">
                              <h2 className="text-lg font-black italic uppercase tracking-tight">
                                TREINOS
                              </h2>
                              <button
                                type="button"
                                onClick={() => appendDay({ name: '', exercises: [] })}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all text-[#ff6600]"
                              >
                                <Plus size={14} /> Adicionar Dia
                              </button>
                            </div>
                            <div className="space-y-4">
                              {dayFields.map((day, index) => (
                                <DayAccordion
                                  key={day.id}
                                  dayIndex={index}
                                  register={formPlan.register}
                                  removeDay={removeDay}
                                  control={formPlan.control}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-center">
                            <button
                              disabled={loading}
                              type="submit"
                              className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#ff6600] text-black text-[10px] font-black uppercase tracking-widest hover:bg-[#ff5500] transition-all shadow-xl active:scale-95 whitespace-nowrap"
                            >
                              {loading ? 'Sincronizando...' : 'SALVAR PLANO'}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>{' '}
                  </div>
                )}
              </div>
            ) : activeTab === 'generator' ? (
              <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-700 py-10">
                {selectedPlan ? (
                  <PlanDetailsView
                    plan={selectedPlan}
                    onBack={() => setSelectedPlan(null)}
                    completedExercises={completedExercises}
                    toggleCheck={toggleCheck}
                    onDeletePlan={handleDeleteGeneratedWorkout}
                    onDeleteExercise={handleDeleteExercise}
                    onUpdatePlanName={onUpdatePlanName}
                    onUpdateDayName={onUpdateDayName}
                    onUpdateExercise={onUpdateExercise}
                    onAddExercise={onAddExercise}
                    onReorderDays={onReorderDays}
                    onAddDay={onAddDay}
                    onDeleteDay={onDeleteDay}
                    onFinishWorkout={onFinishWorkout}
                    onClearDayExercises={onClearDayExercises}
                    onForceRefresh={async () => { 
  await fetchPlans();
  await fetchGeneratedWorkouts();
  await fetchHistory();
  
  // Atualiza o plano selecionado se existir
  if (selectedPlan) {
    const planId = selectedPlan._id || selectedPlan.id;
    const isGenerated = activeTab === 'generator';
    
    let updatedPlan;
    if (isGenerated) {
      updatedPlan = generatedWorkouts.find(p => (p._id || p.id) === planId);
    } else {
      updatedPlan = plans.find(p => (p._id || p.id) === planId);
    }
    
    if (updatedPlan) {
      setSelectedPlan(updatedPlan);
    }
  }
}}
isGenerated={true} 
                    />
                ) : (
                  <>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                      <div className="space-y-1 -mt-11">
                        <div className="text-[#ff6600] font-black italic uppercase tracking-tighter text-4xl leading-none">
                          TREINOS <br /> AUTOMÁTICOS
                        </div>
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.4em]">
                          Protocolos Automatizados de Alta Performance
                        </p>
                      </div>
                      <div className="inline-block">
                        <button
                          onClick={() => setIsGeneratingCustom(!isGeneratingCustom)}
                          className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-[#ff6600] transition-all shadow-xl active:scale-95 whitespace-nowrap"
                        >
                          <Zap size={16} strokeWidth={2} /> Gerar TREINO
                        </button>
                      </div>
                    </div>

                    <MetricsGridAuto
                      stats={stats}
                      plans={plans}
                      generatedWorkouts={generatedWorkouts}
                      setIsPRSearchOpen={setIsPRSearchOpen}
                    />

                    {/* TREINOS AUTOMÁTICOS: A partir do 7º Treino entra no oculto */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-500 px-2 w-full">
                      {generatedWorkouts.slice(0, visibleWorkouts).map((workout, idx) => {
                        const decorativeIcons = [Dumbbell, Zap, Flame, Heart, Star, Crown, Anchor, Gem];
                        const DecorativeIcon = decorativeIcons[idx % decorativeIcons.length];
                        return (
                          <div
                            key={workout._id || workout.id || idx}
                            onClick={() => setSelectedPlan(workout)}
                            className="group relative p-8 rounded-[2.5rem] border border-[#ff6600]/10 hover:border-[#ff6600]/50 transition-all shadow-xl overflow-hidden cursor-pointer active:scale-95 min-h-[220px] flex flex-col justify-end w-full"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a0a00] to-[#2a1000] group-hover:via-[#1a1c00] transition-colors duration-500" />
                            <div className="absolute -right-8 -top-8 text-[#ff6600]/[0.04] group-hover:text-[#ff6600]/[0.08] transition-all duration-700 transform rotate-12">
                              <DecorativeIcon size={240} strokeWidth={1} />
                            </div>
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#ff6600]/20 group-hover:bg-[#ff6600] transition-all duration-300" />
                            <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#ff6600] shadow-[0_0_15px_#ff6600] transition-all duration-700 group-hover:w-full" />
                            <div className="space-y-4 relative z-10">
                              <div className="space-y-1">
                                <div className="w-12 h-1.5 bg-[#ff6600] rounded-full mb-4 shadow-[0_0_15px_rgba(212,255,0,0.4)]"></div>
                                <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none group-hover:text-[#ff6600] transition-colors">
                                  {workout.name}
                                </h3>
                              </div>
                              <div className="flex items-center justify-between pt-2">
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                                    Treino Gerado
                                  </span>
                                  <span className="text-xs font-bold text-white uppercase">
                                    {workout.goal} • {workout.daysCount} DIAS
                                  </span>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-black border border-white/5 flex items-center justify-center text-gray-500 group-hover:text-black group-hover:bg-[#ff6600] transition-all shadow-lg">
                                  <ChevronRight size={24} strokeWidth={3} />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {generatedWorkouts.length > 6 && (
                      <div className="flex justify-center mt-4">
  <div
    onClick={() => setVisibleWorkouts(visibleWorkouts === 6 ? generatedWorkouts.length : 6)}
    className="text-[#ff6600] hover:text-[#ff5500] hover:scale-105 active:scale-95 transition-all cursor-pointer"
  >
    <div className="flex items-center gap-2">
      <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
        {visibleWorkouts === 6 ? `Exibir mais (${generatedWorkouts.length - 6})` : 'Exibir menos'}
      </span>
    </div>
  </div>
</div>
                    )}

                    <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl text-center mx-2">
                      <p className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.2em] leading-relaxed">
                        O sistema seleciona exercícios baseados na biomecânica <br /> do objetivo
                        escolhido.
                      </p>
                    </div>
                  </>
                )}

                {isGeneratingCustom && (
                  <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-[#111111] border border-white/5 p-5 rounded-2xl w-full max-w-[95%] sm:max-w-[450px] md:max-w-[500px] shadow-2xl relative max-h-[80vh] overflow-y-auto my-auto">
                      <button
                        onClick={() => setIsGeneratingCustom(false)}
                        className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors"
                      >
                        <X size={18} />
                      </button>
                      <div className="text-center space-y-1 mb-4">
                        <h3 className="text-lg sm:text-xl font-black italic uppercase tracking-tighter text-white">
                          GERAR TREINO AUTOMÁTICO
                        </h3>
                        <p className="text-gray-500 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                          ESCOLHA SEU OBJETIVO E FREQUÊNCIA
                        </p>
                      </div>
                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          onGenerateSubmit();
                        }}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest ml-1">
                            OBJETIVO
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedGoal('hipertrofia')}
                              className={`py-2 rounded-xl border-2 font-black italic uppercase text-[9px] tracking-widest transition-all ${selectedGoal === 'hipertrofia' ? 'bg-[#ff6600] border-[#ff6600] text-black shadow-[0_0_20px_rgba(255,102,0,0.3)]' : 'bg-black/40 border-white/5 text-gray-500 hover:border-white/20'}`}
                            >
                              HIPERTROFIA
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedGoal('força')}
                              className={`py-2 rounded-xl border-2 font-black italic uppercase text-[9px] tracking-widest transition-all ${selectedGoal === 'força' ? 'bg-[#ff6600] border-[#ff6600] text-black shadow-[0_0_20px_rgba(255,102,0,0.3)]' : 'bg-black/40 border-white/5 text-gray-500 hover:border-white/20'}`}
                            >
                              FORÇA
                            </button>
                            <button
                              type="button"
                              onClick={() => setSelectedGoal('resistência')}
                              className={`py-2 rounded-xl border-2 font-black italic uppercase text-[9px] tracking-widest transition-all ${selectedGoal === 'resistência' ? 'bg-[#ff6600] border-[#ff6600] text-black shadow-[0_0_20px_rgba(255,102,0,0.3)]' : 'bg-black/40 border-white/5 text-gray-500 hover:border-white/20'}`}
                            >
                              RESISTÊNCIA
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase font-black text-gray-500 tracking-widest ml-1">
                            FREQUÊNCIA SEMANAL (DIAS)
                          </label>
                          <div className="flex items-center justify-between bg-black/40 p-1.5 rounded-xl border border-white/5">
                            {[2, 3, 4, 5, 6].map((num) => (
                              <button
                                key={num}
                                type="button"
                                onClick={() => formGenerate.setValue('days', num)}
                                className={`w-10 h-10 rounded-lg font-black italic transition-all ${formGenerate.watch('days') === num ? 'bg-white text-black scale-105' : 'text-gray-600 hover:text-white'}`}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2 pt-3">
                          <button
                            type="button"
                            onClick={() => setIsGeneratingCustom(false)}
                            className="flex-1 py-2 bg-white/5 text-gray-400 font-black uppercase text-[9px] tracking-widest rounded-lg hover:bg-white/10 transition-all"
                          >
                            CANCELAR
                          </button>
                          <button
                            disabled={loading}
                            type="submit"
                            className="flex-1 py-2 bg-[#ff6600] text-black font-black uppercase text-[9px] tracking-widest rounded-lg hover:bg-[#ff5500] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1"
                          >
                            {loading ? '...' : 'GERAR'} <ChevronRight size={12} />
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in duration-500 px-2 pb-10">
  <div className="text-center space-y-2 relative flex flex-col items-center">
    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-white">
      EVOLUÇÃO
    </h1>
    <p className="text-gray-500 font-bold uppercase text-xs tracking-[0.3em]">
      Seu registro de força
    </p>
    
    {history.length > 0 && (
      <div className="mt-2 md:absolute md:top-0 md:right-0 md:mt-0">
        <span 
          onClick={() => setIsHistoryResetOpen(true)}
          className="text-[9px] font-black italic uppercase tracking-[0.2em] text-gray-700 hover:text-red-500 transition-colors cursor-pointer"
        >
          Limpar histórico
        </span>
      </div>
    )}
  </div>
  
  {isHistoryResetOpen && (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-[#111111] border border-red-900/20 p-8 rounded-[2rem] w-full max-w-md space-y-6 shadow-2xl relative">
        <button
          onClick={() => {
            setIsHistoryResetOpen(false);
            setHistoryConfirmInput('');
          }}
          className="absolute top-6 right-6 text-gray-500 hover:text-white"
        >
          <X size={20} />
        </button>
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
            Limpar Histórico
          </h3>
          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
            Isso removerá permanentemente todos os logs de exercícios finalizados.
          </p>
        </div>
        <div className="space-y-4">
          <p className="text-[9px] text-center font-black uppercase text-gray-500">
            Digite <span className="text-red-500 italic">"CONFIRM"</span> abaixo para prosseguir
          </p>
          <input
            className="w-full bg-black border border-white/10 rounded-xl p-4 text-white text-center font-black uppercase text-sm outline-none focus:border-red-500"
            placeholder="DIGITE AQUI"
            value={historyConfirmInput}
            onChange={(e) => setHistoryConfirmInput(e.target.value)}
          />
          <button
            onClick={handleClearHistory}
            disabled={historyConfirmInput !== 'CONFIRM' || loading}
            className="w-full py-4 rounded-xl font-black italic bg-red-600 text-white uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all disabled:opacity-30"
          >
            {loading ? 'Apagando...' : 'DELETAR TUDO'}
          </button>
        </div>
      </div>
    </div>
  )}

  {history.length === 0 ? (
    <div className="py-20 text-center space-y-6 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[2.5rem]">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-gray-700 mx-auto">
        <Activity size={32} />
      </div>
      <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em]">
        Ainda não há historico de exercicios.
      </p>
    </div>
  ) : (
    (() => {
      // Agrupa por nome do treino
      const groupedHistory = history.reduce((groups, log) => {
        const workoutName = log.workoutName || log.dayName || 'TREINO';
        if (!groups[workoutName]) groups[workoutName] = [];
        groups[workoutName].push(log);
        return groups;
      }, {});
      
      return Object.entries(groupedHistory).map(([workoutName, logs], groupIdx) => (
        <div key={groupIdx} className="space-y-4 mb-8">
          {/* Nome do treino */}
          <div className="flex items-center gap-2 px-2">
            <div className="h-px flex-grow bg-[#ff6600]/20"></div>
            <h2 className="text-sm sm:text-base font-black italic uppercase tracking-wider text-[#ff6600] px-3">
              {workoutName}
            </h2>
            <div className="h-px flex-grow bg-[#ff6600]/20"></div>
          </div>
          
          {/* Exercícios do treino */}
          <div className="space-y-3">
            {logs.map((log, idx) => (
              <div
                key={idx}
                onClick={async () => {
                  try {
                    const res = await api.get(`/workouts/history/${encodeURIComponent(log.exerciseName || log.name)}`);
                    setSelectedExerciseHistory({ name: log.exerciseName || log.name, logs: res.data });
                  } catch(e) { console.error(e); }
                }}
                className="group relative p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#ff6600]/30 transition-all flex items-center justify-between overflow-hidden cursor-pointer"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff6600]/10 group-hover:bg-[#ff6600] transition-all"></div>
                
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#ff6600]/5 flex items-center justify-center text-[#ff6600] group-hover:bg-[#ff6600] group-hover:text-black transition-all shadow-lg flex-shrink-0">
                    <Trophy size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm sm:text-base font-black italic uppercase text-white leading-tight group-hover:text-[#ff6600] transition-colors overflow-hidden text-ellipsis whitespace-nowrap">
                      {log.exerciseName || log.name}
                    </h3>
                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                      {new Date(log.date).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                
                <div className="text-right flex items-center gap-3 flex-shrink-0">
                  <div className="flex flex-col items-end">
                    <p className="text-xl font-black italic text-[#ff6600] leading-none">
                      {log.weight}<span className="text-xs">KG</span>
                    </p>
                    <p className="text-[9px] font-black uppercase text-gray-600">
                      {log.reps} Reps
                    </p>
                  </div>
                  <ChevronRight className="text-gray-800 group-hover:text-[#ff6600] transition-colors" size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ));
    })()
  )}
                {selectedExerciseHistory && (
                  <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-[#111111] border border-[#ff6600]/20 p-8 rounded-[2.5rem] w-full max-w-2xl max-h-[85vh] overflow-y-auto no-scrollbar space-y-6 shadow-2xl relative animate-in zoom-in duration-300">
                      <div className="flex justify-between items-start sticky top-0 bg-[#111111] z-10 pb-4">
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-[#ff6600] leading-none tracking-tight break-words">
                            {selectedExerciseHistory.name}
                          </h2>
                          <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-2">
                            Análise de Evolução de Carga
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedExerciseHistory(null)}
                          className="p-2 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-full"
                        >
                          <X size={20} />
                        </button>
                      </div>
                      <div className="space-y-4">
                        {selectedExerciseHistory.logs.map((h, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-all group/item"
                          >
                            <div className="flex flex-col">
                              <div className="flex items-center gap-2">
                                <Clock size={12} className="text-gray-600" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                  {new Date(h.date).toLocaleDateString('pt-BR')}
                                </span>
                              </div>
                              <span className="text-[8px] font-black text-gray-700 uppercase ml-5">
                                {new Date(h.date).toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-8">
                              <div className="text-right">
                                <span className="block text-3xl font-black italic text-white leading-none group-hover/item:text-[#ff6600] transition-colors">
                                  {h.weight}
                                  <span className="text-sm font-black italic ml-1">KG</span>
                                </span>
                              </div>
                              <div className="w-14 h-14 rounded-2xl bg-[#ff6600]/10 flex flex-col items-center justify-center border border-[#ff6600]/20 shadow-inner group-hover/item:bg-[#ff6600] group-hover/item:text-black transition-all">
                                <span className="text-lg font-black">{h.reps}</span>
                                <span className="text-[7px] font-black uppercase opacity-60">
                                  Reps
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      );
    }
    switch (view) {
      case 'login':
        return (
          <AuthWrapper
            title="Login Arena"
            subtitle="Insira suas credenciais de Atleta."
            onSubmit={formLogin.handleSubmit(onLoginSubmit)}
            onBack={() => setView('landing')}
            uiMessage={uiMessage}
            loading={loading}
          >
            <InputField
              label="E-mail"
              type="email"
              icon={Mail}
              error={formLogin.formState.errors.email?.message}
              {...formLogin.register('email')}
            />
            <div className="space-y-1">
              <InputField
                label="Senha"
                type="password"
                icon={Lock}
                error={formLogin.formState.errors.password?.message}
                {...formLogin.register('password')}
              />
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setView('forgotPassword')}
                  className="text-[10px] text-gray-600 font-bold uppercase tracking-widest hover:text-[#ff6600] transition-colors"
                >
                  Esqueci a senha
                </button>
              </div>
            </div>
            <div className="space-y-4 pt-2">
              <button
                disabled={loading}
                type="submit"
                className={`w-full py-4 rounded-xl font-black italic text-black uppercase tracking-wider ${theme.colors.primaryBg} ${theme.colors.primaryHover} transition-all disabled:opacity-50`}
              >
                Entrar
              </button>
              <div className="relative flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <span className="relative bg-[#111111] px-2 text-[8px] uppercase font-black text-gray-700 tracking-widest italic">
                  ou
                </span>
              </div>
              <button
                type="button"
                onClick={() => setView('register')}
                className="w-full py-4 rounded-xl font-bold text-white border-2 border-white/10 hover:bg-white/5 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
              >
                <UserPlus size={16} /> Criar nova conta
              </button>
            </div>
          </AuthWrapper>
        );
      case 'register':
        return (
          <AuthWrapper
            title="Crie sua Conta"
            subtitle="Junte-se à melhor infraestrutura de força."
            onSubmit={formRegister.handleSubmit(onRegisterSubmit)}
            onBack={() => setView('landing')}
            uiMessage={uiMessage}
            loading={loading}
          >
            <InputField
              label="Seu nome"
              type="text"
              icon={User}
              error={formRegister.formState.errors.name?.message}
              {...formRegister.register('name')}
            />
            <InputField
              label="E-mail"
              type="email"
              icon={Mail}
              error={formRegister.formState.errors.email?.message}
              {...formRegister.register('email')}
            />
            <InputField
              label="Senha"
              type="password"
              icon={Lock}
              error={formRegister.formState.errors.password?.message}
              {...formRegister.register('password')}
            />
            <button
              disabled={loading}
              type="submit"
              className={`w-full py-4 rounded-xl font-black italic text-black uppercase tracking-wider ${theme.colors.primaryBg} ${theme.colors.primaryHover} transition-all mt-2`}
            >
              Registrar
            </button>
          </AuthWrapper>
        );
      default:
        return <LandingPage onStart={(mode) => setView(mode)} />;
    }
  };useEffect(() => {
  const handleResize = () => {
    if (window.innerHeight < window.screen.height * 0.8) {
      document.body.classList.add('keyboard-open');
    } else {
      document.body.classList.remove('keyboard-open');
    }
  };
  
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
  return (
    <div className="font-sans antialiased selection:bg-[#ff6600] selection:text-black">
      {renderView()}
    </div>
  );
}

export default function App() {
  useScrollToInput();
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
        input.day-name-input:-webkit-autofill { -webkit-text-fill-color: #ff6600 !important; }
        .overflow-visible { overflow: visible !important; }
        .whitespace-nowrap { white-space: nowrap; }

        @media (max-width: 768px) {
          body.keyboard-open {
            padding-bottom: 200px;
          }
        }
 html, body {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
html::-webkit-scrollbar, body::-webkit-scrollbar {
  display: none;
}

      `}</style>
      <MainContent />
    </AuthProvider>
  );
}