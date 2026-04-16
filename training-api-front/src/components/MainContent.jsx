import React, { useState, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import MetricsGrid from './MetricsGrid';
import MetricsGridAuto from './MetricsGridAuto';
import { useScrollToInput } from '../hooks/useScrollToInput';
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
import api from '../services/api';
import {
  loginSchema,
  registerSchema,
  verifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  planSchema,
  generateWorkoutSchema,
} from '../schemas';
import { theme } from '../utils/theme';
import { useAuth } from '../context/AuthContext';
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
} from './index';

export const MainContent = () => {
  const { isAuthenticated, login, logout, user } = useAuth();

  const [view, setView] = useState(() => {
    const saved = localStorage.getItem('@superfrango:view');
    return saved || 'landing';
  });
  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('@superfrango:activeTab');
    return saved || 'dashboard';
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [tempEmail, setTempEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [uiMessage, setUiMessage] = useState({ type: '', text: '' });
  const [isInternalReset, setIsInternalReset] = useState(false);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [loadingImport, setLoadingImport] = useState(false);
  const [plans, setPlans] = useState([]);
  const [generatedWorkouts, setGeneratedWorkouts] = useState([]);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(() => {
    const saved = localStorage.getItem('@superfrango:selectedPlan');
    return saved ? JSON.parse(saved) : null;
  });
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [showCreatePlan, setShowCreatePlan] = useState(false);

  const [history, setHistory] = useState([]);
  const [selectedExerciseHistory, setSelectedExerciseHistory] = useState(null);

  const [isPRSearchOpen, setIsPRSearchOpen] = useState(false);
  const [prSearchQuery, setPRSearchQuery] = useState('');
  const [prSearchResult, setPRSearchResult] = useState(null);
  const [searchingPR, setSearchingPR] = useState(false);

  const [completedExercises, setCompletedExercises] = useState(() => {
    const saved = localStorage.getItem('@superfrango:completed');
    return saved ? JSON.parse(saved) : {};
  });

  const [selectedGoal, setSelectedGoal] = useState('hipertrofia');

  const [visiblePlans, setVisiblePlans] = useState(6);
  const [visibleWorkouts, setVisibleWorkouts] = useState(6);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isHistoryResetOpen, setIsHistoryResetOpen] = useState(false);
  const [historyConfirmInput, setHistoryConfirmInput] = useState('');

  useEffect(() => {
    localStorage.setItem('@superfrango:view', view);
  }, [view]);

  useEffect(() => {
    localStorage.setItem('@superfrango:activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (selectedPlan) {
      localStorage.setItem('@superfrango:selectedPlan', JSON.stringify(selectedPlan));
    } else {
      localStorage.removeItem('@superfrango:selectedPlan');
    }
  }, [selectedPlan]);

  useEffect(() => {
    localStorage.setItem('@superfrango:completed', JSON.stringify(completedExercises));
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

  useEffect(() => {
    if (isImportModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isImportModalOpen]);

  const toggleCheck = (key) => {
    setCompletedExercises((prev) => {
      if (prev[key]) {
        const { [key]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: { completed: true, timestamp: Date.now() } };
    });
  };

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

  useEffect(() => {
    if (isPRSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isPRSearchOpen]);

  const handleImportPlan = async () => {
    if (!importCode.trim()) return;
    setLoadingImport(true);
    try {
      await api.post(`/workout-plans/copy/${importCode.trim()}`);
      setUiMessage({ type: 'success', text: 'Plano copiado com sucesso!' });
      setIsImportModalOpen(false);
      setImportCode('');
      fetchPlans();
    } catch (error) {
      setUiMessage({ type: 'error', text: error.response?.data?.message || 'Código inválido' });
      setIsImportModalOpen(false);
    } finally {
      setLoadingImport(false);
    }
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

  const handleTabChange = (newTab) => {
    if (newTab === activeTab) return;

    setIsGeneratingCustom(false);
    setShowCreatePlan(false);
    setSelectedPlan(null);

    setIsTransitioning(true);
    setTimeout(() => {
      setActiveTab(newTab);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 150);
    }, 150);
  };

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
    console.log('Dados sendo enviados:', data);
    setLoading(true);
    const result = await login(data);
    console.log('Resultado:', result);
    setLoading(false);

    if (result && result.success) { // <-- ADICIONE "result &&"
      setIsProfileOpen(false);
      setView('dashboard');
      return;
    }

    if (result && result.notVerified) {
      setTempEmail(data.email);
      setUiMessage({
        type: 'error',
        text: 'E-mail não verificado! Enviamos um novo código.'
      });
      setTimeout(() => setView('verify'), 1500);
      return;
    }

    setUiMessage({
      type: 'error',
      text: (result && result.message) || 'Email ou senha incorretos'
    });
  };

  const onRegisterSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/users/register', data);
      setTempEmail(data.email);
      setUiMessage({ type: 'success', text: 'Conta criada! Verifique seu e-mail.' });
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
      setUiMessage({ type: 'success', text: 'E-mail validadidado, faça login.' });
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
      setShowCreatePlan(false);
      formPlan.reset();
      fetchPlans();
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

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
          <div className="fixed inset-0 bg-black flex flex-col items-center justify-start pt-[20vh] p-6 select-none overflow-hidden">
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ff6600] rounded-full blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900 rounded-full blur-[120px]" />
            </div>
            <div className="z-10 w-full flex justify-center">
              <div className="w-full max-w-md bg-neutral-900/95 border border-white/10 p-7 rounded-[2rem] shadow-2xl space-y-6 md:backdrop-blur-3xl relative">
                <button
                  onClick={() => setView('landing')}
                  className="absolute top-5 right-6 p-1 text-gray-500 hover:text-white transition-colors z-10"
                >
                  <X size={16} />
                </button>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#ff6600]/20 to-[#ff6600]/5 text-[#ff6600] rounded-xl flex items-center justify-center mx-auto border border-[#ff6600]/20 shadow-[0_0_15px_rgba(255,102,0,0.1)]">
                    <KeyRound size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                      RECUPERAR SENHA
                    </h3>
                    <p className="text-neutral-500 text-[8px] font-bold uppercase tracking-[0.2em] mt-0.5">
                      Enviaremos um código para seu e-mail
                    </p>
                  </div>
                </div>

                <form onSubmit={formForgot.handleSubmit(onForgotSubmit)} className="space-y-6">
                  <div className="space-y-3.5">
                    <InputField
                      label="E-mail"
                      type="email"
                      icon={Mail}
                      placeholder="seu@email.com"
                      autoComplete="off"
                      error={formForgot.formState.errors.email?.message}
                      {...formForgot.register('email')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-black italic bg-[#ff6600] text-black uppercase text-[11px] tracking-[0.15em] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,102,0,0.9)]"
                  >
                    {loading ? 'PROCESSANDO...' : 'ENVIAR CÓDIGO'}
                    {!loading && <ChevronRight size={16} />}
                  </button>
                </form>

                <div className="pt-2 text-center">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    Lembrou a senha?{' '}
                  </span>
                  <button
                    onClick={() => setView('login')}
                    className="text-[10px] font-bold text-[#ff6600] uppercase tracking-widest hover:scale-105 transition-transform duration-200 inline-block"
                  >
                    Voltar ao login
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      if (view === 'resetPassword')
        return (
          <div className="fixed inset-0 bg-black flex flex-col items-center justify-start pt-[11vh] p-6 select-none overflow-hidden">
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ff6600] rounded-full blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900 rounded-full blur-[120px]" />
            </div>
            <div className="z-10 w-full flex justify-center">
              <div className="w-full max-w-md bg-neutral-900/95 border border-white/10 p-7 rounded-[2rem] shadow-2xl space-y-6 md:backdrop-blur-3xl relative">
                <button
                  onClick={() => setView('landing')}
                  className="absolute top-5 right-6 p-1 text-gray-500 hover:text-white transition-colors z-10"
                >
                  <X size={16} />
                </button>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#ff6600]/20 to-[#ff6600]/5 text-[#ff6600] rounded-xl flex items-center justify-center mx-auto border border-[#ff6600]/20 shadow-[0_0_15px_rgba(255,102,0,0.1)]">
                    <Lock size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                      NOVA SENHA
                    </h3>
                    <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">
                      Digite o código e a nova senha
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <StatusMessage type={uiMessage.type} message={uiMessage.text} />
                </div>
                <form onSubmit={formReset.handleSubmit(onResetSubmit)} className="space-y-6">
                  <div className="space-y-3.5">
                    <InputField
                      label="Código de 6 dígitos"
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      autoComplete="off"
                      error={formReset.formState.errors.code?.message}
                      {...formReset.register('code')}
                    />
                    <InputField
                      label="Nova Senha"
                      type="password"
                      icon={Lock}
                      placeholder="••••••••"
                      autoComplete="off"
                      error={formReset.formState.errors.password?.message}
                      {...formReset.register('password')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-black italic bg-[#ff6600] text-black uppercase text-[11px] tracking-[0.15em] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,102,0,0.9)]"
                  >
                    {loading ? 'PROCESSANDO...' : 'REDEFINIR SENHA'}
                    {!loading && <ChevronRight size={16} />}
                  </button>
                </form>

                <div className="pt-2 text-center">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    Lembrou a senha?{' '}
                  </span>
                  <button
                    onClick={() => setView('login')}
                    className="text-[10px] font-bold text-[#ff6600] uppercase tracking-widest hover:scale-105 transition-transform duration-200 inline-block"
                  >
                    Voltar ao login
                  </button>
                </div>
              </div>
            </div>

          </div>
        );
      if (view === 'verify')
        return (
          <div className="fixed inset-0 bg-black flex flex-col items-center justify-start pt-[25vh] p-6 select-none overflow-hidden">
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ff6600] rounded-full blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900 rounded-full blur-[120px]" />
            </div>
            <div className="z-10 w-full flex justify-center">
              <div className="w-full max-w-md bg-neutral-900/95 border border-white/10 p-7 rounded-[2rem] shadow-2xl space-y-6 md:backdrop-blur-3xl relative">
                <button
                  onClick={() => setView('landing')}
                  className="absolute top-5 right-6 p-1 text-gray-500 hover:text-white transition-colors z-10"
                >
                  <X size={16} />
                </button>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#ff6600]/20 to-[#ff6600]/5 text-[#ff6600] rounded-xl flex items-center justify-center mx-auto border border-[#ff6600]/20 shadow-[0_0_15px_rgba(255,102,0,0.1)]">
                    <Mail size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                      VERIFICAR EMAIL
                    </h3>
                    <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">
                      Código enviado
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <StatusMessage type={uiMessage.type} message={uiMessage.text} />
                </div>
                <form onSubmit={formVerify.handleSubmit(onVerifySubmit)} className="space-y-6">
                  <div className="space-y-3.5">
                    <input
                      autoFocus
                      autoComplete="off"
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-5 text-white text-center font-black text-2xl tracking-[0.5em] outline-none focus:border-[#ff6600] transition-all focus:bg-black/60"
                      placeholder="000000"
                      maxLength={6}
                      {...formVerify.register('code')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-black italic bg-[#ff6600] text-black uppercase text-[11px] tracking-[0.15em] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,102,0,0.9)]"
                  >
                    {loading ? 'PROCESSANDO...' : 'CONFIRMAR CÓDIGO'}
                    {!loading && <ChevronRight size={16} />}
                  </button>
                </form>
              </div>
            </div>
          </div>
        );
    }

    if (isAuthenticated) {
      return (
        <div
          className={`min-h-screen ${theme.colors.background} text-white md:pt-24 px-4 relative overflow-x-hidden`}
        >
          {!selectedPlan && !isCreatingPlan && (
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden h-[100vh] h-[100svh]">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-60"
                style={{
                  backgroundImage: `url('https://images.unsplash.com/photo-1728486145245-d4cb0c9c3470?q=80&w=2070&auto=format&fit=crop')`,
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/100 via-black/65 to-black/70" />
              <div className="absolute inset-0 bg-black/30" />
            </div>
          )}
          {!showCreatePlan && !isGeneratingCustom && (
            <Navbar
              activeTab={activeTab}
              setActiveTab={handleTabChange}
              onOpenProfile={() => setIsProfileOpen(true)}
            />
          )}
          <ProfileSideMenu
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            user={user}
            logout={logout}
            setView={setView}
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
                    autoComplete="off"
                    error={formChangePassword.formState.errors.oldPassword?.message}
                    {...formChangePassword.register('oldPassword')}
                  />
                  <InputField
                    label="Nova Senha"
                    type="password"
                    autoComplete="off"
                    icon={ShieldCheck}
                    error={formChangePassword.formState.errors.newPassword?.message}
                    {...formChangePassword.register('newPassword')}
                  />
                  <button
                    type="submit"
                    className={`w-full py-4 rounded-xl font-black italic text-black uppercase text-[10px] tracking-widest ${theme.colors.primaryBg} shadow-[0_0_20px_rgba(255,102,0,0.9)] active:scale-95 transition-all`}
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
                  className="cursor-pointer text-center py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-[#ff6600] transition-colors flex items-center justify-center gap-2 w-full"
                >
                  Redefinição via E-mail
                </button>
              </div>
            }
          />

          {isPRSearchOpen && (
            <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
              <div className="bg-[#111111] border border-white/5 p-8 rounded-[2rem] w-full max-w-md space-y-6 shadow-2xl relative ,my-auto">
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
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">
                    seu pr <span className="text-[#ff6600] drop-shadow-[0_0_8px_rgba(255,102,0,0.2)]">MáXIMO</span>
                  </h3>
                  <p className="text-gray text-[10px] font-bold uppercase tracking-widest">
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

          <main className="max-w-7xl mx-auto w-full pt-13 pb-8 md:pt-8 relative z-10">
            <StatusMessage type={uiMessage.type} message={uiMessage.text} />

            <div className={`transition-all duration-200 ease-out ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>

              {showCreatePlan ? (
                <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl overflow-y-auto">
                  <div className="min-h-full flex flex-col items-center p-4">
                    <div className="w-full max-w-[380px] flex flex-col">
                      <div className="flex items-center gap-3 pt-2 sm:pt-24 -ml-5">
                        <button
                          onClick={() => setShowCreatePlan(false)}
                          className="text-gray-500 hover:text-white transition-colors p-1"
                        >
                          <ArrowLeft size={24} />
                        </button>
                        <div>
                          <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter text-white leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                            CRIAR <br /> TREINOs <span className="text-[#ff6600] drop-shadow-[0_0_15px_rgba(255,102,0,0.0)]"><br /> MANUAIS</span>
                          </h1>
                          <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mt-4">
                            CRIAÇÃO MANUAL PARA FRANGOS DE ELITE
                          </p>
                        </div>
                      </div>

                      <form onSubmit={formPlan.handleSubmit(onPlanSubmit)} className="w-full">
                        <div className={`mt-[25px] p-6 rounded-[2.5rem] bg-[#0a0a0a] border border-white/30 space-y-6 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500`}>
                          <div className="text-center space-y-1">
                            <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">DADOS DO PLANO</h3>
                          </div>

                          <InputField
                            label="NOME DO PLANO"
                            placeholder="Ex: PPL UPPER LOWER"
                            autoComplete="off"
                            {...formPlan.register('name')}
                            error={formPlan.formState.errors.name?.message}
                          />

                          <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="flex items-center justify-between">
                              <h2 className="text-[10px] font-black italic uppercase text-white tracking-widest">TREINOS</h2>
                              <button
                                type="button"
                                onClick={() => appendDay({ name: '', exercises: [] })}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 text-[9px] font-black uppercase text-[#ff6600] border border-[#ff6600]/20 hover:bg-[#ff6600]/10 hover:border-[#ff6600]/40 transition-all"
                              >
                                <Plus size={14} /> Adicionar Dia
                              </button>
                            </div>
                            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1 no-scrollbar">
                              {dayFields.map((day, index) => (
                                <DayAccordion key={day.id} dayIndex={index} register={formPlan.register} removeDay={removeDay} control={formPlan.control} />
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 pt-2">
                            <button
                              disabled={loading}
                              type="submit"
                              className="w-full py-4 rounded-2xl bg-[#ff6600] text-black text-[12px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(255,102,0,0.9)] active:scale-95 transition-all"
                            >
                              {loading ? 'SINCRONIZANDO...' : 'CRIAR PLANO'}
                            </button>
                          </div>
                        </div>
                      </form>
                      <div className="group relative mt-6 p-4 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/80 hover:border-[#ff6600]/40 transition-all duration-500 shadow-2xl overflow-hidden cursor-default">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff6600]/10 group-hover:bg-[#ff6600] transition-all duration-300"></div>
                        <div className="flex items-center gap-4 relative z-10">
                          <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-500 group-hover:bg-[#ff6600] group-hover:text-black group-hover:border-[#ff6600] transition-all duration-300 flex-shrink-0">
                            <Dumbbell size={16} />
                          </div>
                          <div className="flex-1">
                            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.15em] leading-tight group-hover:text-white transition-colors duration-300">
                              Planos manuais <span className="text-[#ff6600]">sob medida</span>.
                              Monte sua estrutura, depois preencha com os exercícios.
                            </p>
                          </div>
                        </div>
                        <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#ff6600] shadow-[0_0_15px_#ff6600] transition-all duration-700 group-hover:w-full" />
                      </div>
                    </div>
                  </div>
                </div>
              ) : activeTab === 'dashboard' ? (
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
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
                        <div className="space-y-1 -mt-">
                          <div className="text-[#ff6600] drop-shadow-[0_0_15px_rgba(255,102,0,0.2)] font-black italic uppercase tracking-tighter text-4xl leading-none">
                            PLANOS <br /> DE TREINOS
                          </div>
                          <p className="text-[11px] font-bold text-white/85 uppercase tracking-[0.4em]">
                            Crie seus treinos manualmente e acompanhe sua evolução
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setShowCreatePlan(true)}
                            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-black text-[10px] font-black uppercase tracking-widest hover:bg-[#ff6600] transition-all shadow-xl active:scale-95"
                          >
                            <Plus size={16} strokeWidth={3} /> Criar treino
                          </button>
                          <button
                            onClick={() => setIsImportModalOpen(true)}
                            className="p-3 rounded-2xl bg-white text-black hover:bg-[#ff6600] hover:text-black transition-all active:scale-95"
                            title="Importar plano"
                          >
                            <svg width="25" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                              <polyline points="8 12 12 16 16 12" />
                              <line x1="12" y1="2" x2="12" y2="16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      {isImportModalOpen && (
                        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
                          <div className="bg-[#111111] border border-white/5 p-8 rounded-[2rem] w-full max-w-md space-y-6 shadow-2xl relative">
                            <button
                              onClick={() => {
                                setIsImportModalOpen(false);
                                setImportCode('');
                              }}
                              className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
                            >
                              <X size={20} />
                            </button>
                            <div className="text-center space-y-2">
                              <div className="w-12 h-12 bg-[#ff6600]/10 text-[#ff6600] rounded-2xl flex items-center justify-center mx-auto mb-2">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
                                  <polyline points="8 12 12 16 16 12" />
                                  <line x1="12" y1="2" x2="12" y2="16" />
                                </svg>
                              </div>
                              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                                IMPORTAR <span className="text-[#ff6600] drop-shadow-[0_0_8px_rgba(255,102,0,0.2)]">PLANO</span>
                              </h3>
                              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">
                                Cole o id do plano que deseja copiar
                              </p>
                            </div>
                            <div className="space-y-4">
                              <input
                                autoFocus
                                className="w-full bg-black border border-white/10 rounded-xl p-4 text-white uppercase font-mono text-sm outline-none focus:border-[#ff6600] text-center"
                                placeholder="EX: XXXX-XXXX-XXXX"
                                value={importCode}
                                onChange={(e) => setImportCode(e.target.value.toUpperCase())}
                              />
                              <button
                                onClick={handleImportPlan}
                                disabled={loadingImport || !importCode.trim()}
                                className="w-full py-4 rounded-xl font-black italic bg-[#ff6600] text-black uppercase text-[10px] tracking-widest shadow-[0_0_20px_rgba(255,102,0,0.9)] active:scale-95 transition-all disabled:opacity-50"
                              >
                                {loadingImport ? 'IMPORTANDO...' : 'IMPORTAR'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
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
                                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Arquitetura</span>
                                          <span className="text-xs font-bold text-white">{plan.daysCount} DIAS DE TREINO</span>
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
                                  className="text-gray-500 hover:text-[#ff5500] hover:scale-105 active:scale-95 transition-all cursor-pointer"
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
                        <form onSubmit={formPlan.handleSubmit(onPlanSubmit)} className="space-y-6 w-full max-w-2xl">
                          <div className={`p-8 rounded-[2rem] ${theme.colors.surfaceLight} border ${theme.colors.border} space-y-6 shadow-xl`}>
                            <div className="text-center space-y-2">
                              <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter text-white">
                                CRIE UM PLANO DE TREINO
                              </h3>
                              <p className="text-gray-500 text-[20px] sm:text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                                ADICIONE DIAS E EXERCÍCIOS NO PLANO
                              </p>
                            </div>

                            <div className="grid md:grid-cols-1 gap-6">
                              <InputField
                                label="NOME DO PLANO"
                                placeholder="Ex: PPL UPPER LOWER"
                                autoComplete="off"
                                {...formPlan.register('name')}
                                error={formPlan.formState.errors.name?.message}
                              />
                            </div>

                            <div className="space-y-6 pt-4 border-t border-white/5">
                              <div className="flex items-center justify-between">
                                <h2 className="text-lg font-black italic uppercase tracking-tight">TREINOS</h2>
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
                                className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#ff6600] text-black text-[10px] font-black uppercase tracking-widest hover:bg-[#ff5500] transition-all shadow-xl active:scale-95 hover:shadow-[0_0_20px_rgba(255,102,0,0.9)] whitespace-nowrap "
                              >
                                {loading ? 'Sincronizando...' : 'SALVAR PLANO'}
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>
              ) : activeTab === 'generator' ? (
                <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
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
                        <div className="space-y-1 -mt-">
                          <div className="text-[#ff6600] drop-shadow-[0_0_15px_rgba(255,102,0,0.2)] font-black italic uppercase tracking-tighter text-4xl leading-none">
                            TREINOS <br /> AUTOMÁTICOS
                          </div>
                          <p className="text-[11px] font-bold text-white/85 uppercase tracking-[0.4em]">
                            TREINOS GERADOS COM BASE NA BIOMECÂNICA DO SEU OBJETIVO
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
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Treino Gerado</span>
                                    <span className="text-xs font-bold text-white uppercase">{workout.goal} • {workout.daysCount} DIAS</span>
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
                            className="text-gray-500 hover:text-[#ff5500] hover:scale-105 active:scale-95 transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-xs sm:text-sm font-black uppercase tracking-wider">
                                {visibleWorkouts === 6 ? `Exibir mais (${generatedWorkouts.length - 6})` : 'Exibir menos'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {isGeneratingCustom && (
                    <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl overflow-y-auto">
                      <div className="min-h-full flex flex-col items-center p-4">
                        <div className="w-full max-w-[380px] flex flex-col">
                          <div className="flex items-center gap-3 pt-1 sm:pt-24 -ml-5">
                            <button
                              onClick={() => setIsGeneratingCustom(false)}
                              className="text-gray-500 hover:text-white transition-colors p-1"
                            >
                              <ArrowLeft size={24} />
                            </button>
                            <div>
                              <h1 className="text-4xl sm:text-6xl font-black italic uppercase tracking-tighter text-white leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                                GERAR <br />TREINOs <span className="text-[#ff6600] drop-shadow-[0_0_15px_rgba(255,102,0,0.0)]"><br /> AUTOMÁTICOs</span>
                              </h1>
                              <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mt-4">
                                PLANOS AUTOMÁTICOS PARA FRANGOS INICIANTES
                              </p>
                            </div>
                          </div>

                          <form onSubmit={(e) => { e.preventDefault(); onGenerateSubmit(); }} className="w-full">
                            <div className={`mt-[25px] p-6 rounded-[2.5rem] bg-[#0a0a0a] border border-white/30 space-y-6 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500`}>
                              <div className="text-center space-y-1">
                                <h3 className="text-lg font-black italic uppercase tracking-tighter text-white">OBJETIVO E DIAS</h3>
                              </div>

                              <div className="grid grid-cols-3 gap-2">
                                {['hipertrofia', 'força', 'resistência'].map((goal) => (
                                  <button
                                    key={goal}
                                    type="button"
                                    onClick={() => setSelectedGoal(goal)}
                                    className={`py-4 rounded-2xl border-2 font-black italic uppercase text-[11px] tracking-tighter transition-all ${selectedGoal === goal
                                        ? 'bg-[#ff6600] border-[#ff6600] text-black shadow-[0_0_15px_rgba(255,102,0,0.9)]'
                                        : 'bg-black/40 border-white/10 text-gray-500 hover:border-white/20'
                                      }`}
                                  >
                                    {goal}
                                  </button>
                                ))}
                              </div>

                              <div className="flex items-center justify-between bg-black/40 p-1.5 rounded-2xl border border-white/10">
                                {[2, 3, 4, 5, 6].map((num) => (
                                  <button
                                    key={num}
                                    type="button"
                                    onClick={() => formGenerate.setValue('days', num)}
                                    className={`w-10 h-10 rounded-xl font-black italic text-sm transition-all ${formGenerate.watch('days') === num
                                        ? 'bg-white text-black scale-105 shadow-lg'
                                        : 'text-gray-500 hover:text-white'
                                      }`}
                                  >
                                    {num}
                                  </button>
                                ))}
                              </div>

                              <div className="flex flex-col gap-3 pt-2">
                                <button
                                  disabled={loading}
                                  type="submit"
                                  className="w-full py-4 rounded-2xl bg-[#ff6600] text-black text-[12px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(255,102,0,0.9)] active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                  {loading ? (
                                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                  ) : (
                                    <><Zap size={14} /> GERAR PLANO</>
                                  )}
                                </button>
                              </div>

                            </div>
                          </form>
                          <div className="group relative mt-6 p-4 rounded-2xl bg-white/[0.03] backdrop-blur-sm border border-white/80 hover:border-[#ff6600]/40 transition-all duration-500 shadow-2xl overflow-hidden cursor-default">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff6600]/10 group-hover:bg-[#ff6600] transition-all duration-300"></div>
                            <div className="flex items-center gap-4 relative z-10">
                              <div className="w-9 h-9 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-500 group-hover:bg-[#ff6600] group-hover:text-black group-hover:border-[#ff6600] transition-all duration-300 flex-shrink-0">
                                <Zap size={16} />
                              </div>
                              <div className="flex-1">
                                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-[0.15em] leading-tight group-hover:text-white transition-colors duration-300">
                                  Treinos automatizados de <span className="text-[#ff6600] group-hover:text-[#ff6600] transition-colors">alta performance</span>.
                                  Escolha seu objetivo e dias para gerar um plano de treino automático.
                                </p>
                              </div>
                            </div>
                            <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-[#ff6600] shadow-[0_0_15px_#ff6600] transition-all duration-700 group-hover:w-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="max-w-4xl mx-auto space-y-8 animate-in zoom-in duration-500 px-2 pb-10">
                  <div className="text-center space-y-2 relative flex flex-col items-center">
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter text-[#ff6600]">EVOLUÇÃO</h1>
                    <p className="text-gray-500 font-bold uppercase text-xs tracking-[0.3em]">Seu registro de força</p>
                    {history.length > 0 && (
                      <div className="mt-2 md:absolute md:top-0 md:right-0 md:mt-0">
                        <span onClick={() => setIsHistoryResetOpen(true)} className="text-[10px] font-black italic uppercase tracking-[0.2em] text-gray/85 hover:text-red-500 transition-colors cursor-pointer">Limpar histórico</span>
                      </div>
                    )}
                  </div>

                  {isHistoryResetOpen && (
                    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                      <div className="bg-[#111111] border border-red-900/20 p-8 rounded-[2rem] w-full max-w-md space-y-6 shadow-2xl relative">
                        <button onClick={() => { setIsHistoryResetOpen(false); setHistoryConfirmInput(''); }} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={20} /></button>
                        <div className="text-center space-y-2">
                          <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-2"><AlertTriangle size={24} /></div>
                          <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Limpar Histórico</h3>
                          <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Isso removerá permanentemente todos os logs de exercícios finalizados.</p>
                        </div>
                        <div className="space-y-4">
                          <p className="text-[9px] text-center font-black uppercase text-gray-500">Digite <span className="text-red-500 italic">"CONFIRM"</span> abaixo para prosseguir</p>
                          <input className="w-full bg-black border border-white/10 rounded-xl p-4 text-white text-center font-black uppercase text-sm outline-none focus:border-red-500" placeholder="DIGITE AQUI" value={historyConfirmInput} onChange={(e) => setHistoryConfirmInput(e.target.value)} />
                          <button onClick={handleClearHistory} disabled={historyConfirmInput !== 'CONFIRM' || loading} className="w-full py-4 rounded-xl font-black italic bg-red-600 text-white uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all disabled:opacity-30">{loading ? 'Apagando...' : 'DELETAR TUDO'}</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {history.length === 0 ? (
                    <div className="py-20 text-center space-y-6 bg-white/[0.02] border-2 border-dashed border-white/5 rounded-[2.5rem]">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-gray-700 mx-auto"><Activity size={32} /></div>
                      <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em]">Ainda não há histórico de exercicios.</p>
                    </div>
                  ) : (
                    (() => {
                      const groupedHistory = history.reduce((groups, log) => {
                        const workoutName = log.workoutName ? log.workoutName.split(' - ')[1] : 'TREINO';
                        if (!groups[workoutName]) groups[workoutName] = [];
                        groups[workoutName].push(log);
                        return groups;
                      }, {});

                      return Object.entries(groupedHistory).map(([workoutName, logs], groupIdx) => (
                        <div key={groupIdx} className="space-y-4 mb-8">
                          <div className="flex items-center gap-2 px-2">
                            <div className="h-px flex-grow bg-[#ff6600]/20"></div>
                            <h2 className="text-sm sm:text-base font-black italic uppercase tracking-wider text-[#ff6600] px-3">{workoutName}</h2>
                            <div className="h-px flex-grow bg-[#ff6600]/20"></div>
                          </div>
                          <div className="space-y-3">
                            {logs.map((log, idx) => (
                              <div key={idx} onClick={async () => { try { const res = await api.get(`/workouts/history/${encodeURIComponent(log.exerciseName || log.name)}`); setSelectedExerciseHistory({ name: log.exerciseName || log.name, logs: res.data }); } catch (e) { console.error(e); } }} className="group relative p-4 rounded-2xl bg-black/1 backdrop-blur-sm border border-white/10 hover:border-[#ff6600]/60 transition-all flex items-center justify-between overflow-hidden cursor-pointer shadow-2xl">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ff6600]/10 group-hover:bg-[#ff6600] transition-all"></div>
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                  <div className="w-10 h-10 rounded-xl bg-[#ff6600]/5 flex items-center justify-center text-[#ff6600] group-hover:bg-[#ff6600] group-hover:text-black transition-all shadow-lg flex-shrink-0"><Trophy size={18} /></div>
                                  <div className="min-w-0 flex-1">
                                    <h3 className="text-sm sm:text-base font-black italic uppercase text-white leading-tight group-hover:text-[#ff6600] transition-colors overflow-hidden text-ellipsis whitespace-nowrap">{log.exerciseName || log.name}</h3>
                                    <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{new Date(log.date).toLocaleString('pt-BR')}</p>
                                  </div>
                                </div>
                                <div className="text-right flex items-center gap-3 flex-shrink-0">
                                  <div className="flex flex-col items-end">
                                    <p className="text-xl font-black italic text-[#ff6600] leading-none">{log.weight}<span className="text-xs">KG</span></p>
                                    <p className="text-[9px] font-black uppercase text-gray-600">{log.reps} Reps</p>
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
                            <h2 className="text-2xl sm:text-3xl font-black italic uppercase text-[#ff6600] leading-none tracking-tight break-words">{selectedExerciseHistory.name}</h2>
                            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-2">Análise de Evolução de Carga</p>
                          </div>
                          <button onClick={() => setSelectedExerciseHistory(null)} className="p-2 text-gray-500 hover:text-white transition-colors bg-white/5 rounded-full"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                          {selectedExerciseHistory.logs.map((h, idx) => (
                            <div key={idx} className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-all group/item">
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2"><Clock size={12} className="text-gray-600" /><span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(h.date).toLocaleDateString('pt-BR')}</span></div>
                                <span className="text-[8px] font-black text-gray-700 uppercase ml-5">{new Date(h.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <div className="flex items-center gap-8">
                                <div className="text-right"><span className="block text-3xl font-black italic text-white leading-none group-hover/item:text-[#ff6600] transition-colors">{h.weight}<span className="text-sm font-black italic ml-1">KG</span></span></div>
                                <div className="w-14 h-14 rounded-2xl bg-[#ff6600]/10 flex flex-col items-center justify-center border border-[#ff6600]/20 shadow-inner group-hover/item:bg-[#ff6600] group-hover/item:text-black transition-all"><span className="text-lg font-black">{h.reps}</span><span className="text-[7px] font-black uppercase opacity-60">Reps</span></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {!selectedPlan && !isCreatingPlan && !showCreatePlan && (
              <footer className="mt-1 mb-9 py-6 border-t border-transparent">
                <div className="text-center">
                  <p className="text-[8px] font-black italic text-gray-600 uppercase tracking-[0.2em]">
                    © {new Date().getFullYear()} Geovani Rodrigues <span className="text-white inline-block mx-1">·</span> Super Frango App
                  </p>
                  <div className="flex items-center justify-center gap-6 mt-3">
                    <a
                      href="https://github.com/Geovanni-dev"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[9px] font-bold text-gray-500 hover:text-white transition-colors group"
                    >
                      <svg className="group-hover:scale-110 transition-transform" height="12" width="12" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" /></svg>
                      GitHub
                    </a>

                    <a
                      href="https://www.linkedin.com/in/geovani-rodrigues-dev/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[9px] font-bold text-gray-500 hover:text-[#0077b5] transition-colors group"
                    >
                      <svg className="group-hover:scale-110 transition-transform" height="12" width="12" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451c.979 0 1.771-.773 1.771-1.729V1.729C24 .774 23.208 0 22.225 0z" /></svg>
                      LinkedIn
                    </a>

                    <a
                      href="https://wa.me/5562984585485"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[9px] font-bold text-gray-500 hover:text-[#25D366] transition-colors group"
                    >
                      <svg className="group-hover:scale-110 transition-transform" height="12" width="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.51 3.45 1.47 4.92L2 22l5.35-1.43c1.43.86 3.07 1.32 4.76 1.32 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.12c-1.49 0-2.95-.4-4.21-1.16l-.3-.18-3.18.85.85-3.09-.19-.31c-.82-1.32-1.25-2.83-1.25-4.37 0-4.56 3.71-8.27 8.27-8.27 4.56 0 8.27 3.71 8.27 8.27s-3.71 8.28-8.27 8.28zm4.53-6.19c-.25-.13-1.47-.73-1.7-.81-.23-.08-.39-.13-.56.13s-.64.81-.78.97c-.14.16-.28.18-.53.05-.25-.13-1.05-.39-2-1.24-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.39.11-.52.11-.11.25-.29.38-.44.13-.15.17-.25.26-.42.09-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43-.14-.01-.31-.01-.48-.01-.17 0-.44.06-.67.32-.23.26-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.8 2.53 1.09 2.53.73 2.99.68.46-.05 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.11-.21-.18-.46-.31z" /></svg>
                      WhatsApp
                    </a>
                  </div>
                </div>
              </footer>
            )}
          </main>
        </div>
      );
    }
    switch (view) {
      case 'login':
        return (
          <div className="fixed inset-0 bg-black flex flex-col items-center justify-start pt-[13vh] p-6 select-none overflow-hidden">
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ff6600] rounded-full blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900 rounded-full blur-[120px]" />
            </div>
            <div className="z-10 w-full flex justify-center">
              <div className="w-full max-w-md bg-neutral-900/95 border border-white/10 p-7 rounded-[2rem] shadow-2xl space-y-6 md:backdrop-blur-3xl relative">

                <button
                  onClick={() => setView('landing')}
                  className="absolute top-5 right-6 p-1 text-gray-500 hover:text-white transition-colors z-10"
                >
                  <X size={16} />
                </button>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#ff6600]/20 to-[#ff6600]/5 text-[#ff6600] rounded-xl flex items-center justify-center mx-auto border border-[#ff6600]/20 shadow-[0_0_15px_rgba(255,102,0,0.1)]">
                    <LogIn size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                      LOGIN
                    </h3>
                    <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">
                      retornar ao super frango app
                    </p>
                  </div>
                </div>
                <StatusMessage type={uiMessage.type} message={uiMessage.text} />
                <form onSubmit={formLogin.handleSubmit(onLoginSubmit)} className="space-y-6">
                  <div className="space-y-3.5">
                    <InputField
                      label="E-mail"
                      type="email"
                      icon={Mail}
                      placeholder="seu@email.com"
                      autoComplete="off"
                      error={formLogin.formState.errors.email?.message}
                      {...formLogin.register('email')}
                    />
                    <div className="space-y-1">
                      <InputField
                        label="Senha"
                        type="password"
                        icon={Lock}
                        placeholder="••••••••"
                        autoComplete="off"
                        error={formLogin.formState.errors.password?.message}
                        {...formLogin.register('password')}
                      />
                      <div className="flex justify-end pr-1">
                        <button
                          type="button"
                          onClick={() => setView('forgotPassword')}
                          className="text-[9px] font-bold text-[#ff6600] uppercase tracking-widest "
                        >
                          Esqueci minha senha
                        </button>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-black italic bg-[#ff6600] text-black uppercase text-[11px] tracking-[0.15em] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,102,0,0.9)]"
                  >
                    {loading ? 'PROCESSANDO...' : 'ENTRAR NO APP'}
                    {!loading && <ChevronRight size={16} />}
                  </button>
                </form>

                <div className="pt-2 text-center">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    Ainda é frango?{' '}
                  </span>
                  <button
                    onClick={() => setView('register')}
                    className="text-[10px] font-bold text-[#ff6600] uppercase tracking-widest hover:scale-105 transition-transform duration-200 inline-block"
                  >
                    Crie sua conta
                  </button>
                </div>
              </div>
            </div>
          </div>
        ); case 'register':
        return (
          <div className="fixed inset-0 bg-black flex flex-col items-center justify-start pt-[10vh] p-6 select-none overflow-hidden">
            <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#ff6600] rounded-full blur-[120px]" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900 rounded-full blur-[120px]" />
            </div>
            <div className="z-10 w-full flex justify-center">
              <div className="w-full max-w-md bg-neutral-900/95 border border-white/10 p-7 rounded-[2rem] shadow-2xl space-y-6 md:backdrop-blur-3xl relative">
                <button
                  onClick={() => setView('landing')}
                  className="absolute top-5 right-6 p-1 text-gray-500 hover:text-white transition-colors z-10"
                >
                  <X size={16} />
                </button>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#ff6600]/20 to-[#ff6600]/5 text-[#ff6600] rounded-xl flex items-center justify-center mx-auto border border-[#ff6600]/20 shadow-[0_0_15px_rgba(255,102,0,0.1)]">
                    <UserPlus size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                      CRIAR CONTA
                    </h3>
                    <p className="text-neutral-500 text-[9px] font-bold uppercase tracking-[0.2em] mt-0.5">
                      torne-se um monstro
                    </p>
                  </div>
                </div>

                <form onSubmit={formRegister.handleSubmit(onRegisterSubmit)} className="space-y-6">
                  <div className="space-y-3.5">
                    <InputField
                      label="Nome"
                      type="text"
                      icon={User}
                      placeholder="NOME"
                      autoComplete="off"
                      error={formRegister.formState.errors.name?.message}
                      {...formRegister.register('name')}
                    />
                    <InputField
                      label="E-mail"
                      type="email"
                      icon={Mail}
                      placeholder="seu@email.com"
                      autoComplete="off"
                      error={formRegister.formState.errors.email?.message}
                      {...formRegister.register('email')}
                    />
                    <InputField
                      label="Senha"
                      type="password"
                      icon={Lock}
                      placeholder="••••••••"
                      autoComplete="off"
                      error={formRegister.formState.errors.password?.message}
                      {...formRegister.register('password')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-xl font-black italic bg-[#ff6600] text-black uppercase text-[11px] tracking-[0.15em] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,102,0,0.9)]"
                  >
                    {loading ? 'PROCESSANDO...' : 'CRIAR MINHA CONTA'}
                    {!loading && <ChevronRight size={16} />}
                  </button>
                </form>

                <div className="pt-2 text-center">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                    Já é um monstro?{' '}
                  </span>
                  <button
                    onClick={() => setView('login')}
                    className="text-[10px] font-bold text-[#ff6600] uppercase tracking-widest hover:scale-105 transition-transform duration-200 inline-block"
                  >
                    Faça login
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return <LandingPage onStart={(mode) => setView(mode)} />;
    }
  };

  return (
    <div className="font-sans antialiased selection:bg-[#ff6600] selection:text-black">
      {renderView()}
    </div>
  );
};