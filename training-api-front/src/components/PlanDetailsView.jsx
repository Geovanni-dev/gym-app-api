import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Trash2,
  Edit3,
  Check,
  ChevronUp,
  ChevronDown,
  Plus,
  X,
  CheckSquare,
  Dumbbell,
  Zap,
  Flame,
  Trophy,
  AlertTriangle,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import api from '../services/api';

export const PlanDetailsView = ({
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
  onDeleteDay,
  onFinishWorkout,
  onClearDayExercises,
  isGenerated = false,
  onForceRefresh,
}) => {
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [editingPlanName, setEditingPlanName] = useState(null);
  const [editingDayIdx, setEditingDayIdx] = useState(null);
  const [tempDayName, setTempDayName] = useState('');
  const [editingExercise, setEditingExercise] = useState(null);
  const [addingToDay, setAddingToDay] = useState(null);
  const [addingNewDay, setAddingNewDay] = useState(false);
  const [newDayTitle, setNewDayTitle] = useState('');
  const [newExData, setNewExData] = useState({ name: '', sets: '', reps: '', weight: '' });
  const [syncingPR, setSyncingPR] = useState(null);
  const [holdProgress, setHoldProgress] = useState(0);
  const timerRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const [openDays, setOpenDays] = useState(() => {
    const saved = localStorage.getItem('@superfrango:openDays');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleDayVisibility = (dayName) => {
    setOpenDays((prev) => {
      const newState = { ...prev, [dayName]: !prev[dayName] };
      localStorage.setItem('@superfrango:openDays', JSON.stringify(newState));
      return newState;
    });
  };

  const hasDayCompletedExercises = (dayIdx) => {
    const day = plan.days[dayIdx];
    if (!day) return false;

    return day.exercises.some((_, exIdx) => {
      const key = `${plan._id || plan.id}-${dayIdx}-${exIdx}`;
      return !!completedExercises[key];
    });
  };

  const handleFinishDayWorkout = async (dayIdx) => {
    const day = plan.days[dayIdx];
    if (!day) return;

    const planId = plan._id || plan.id;
    const entriesToLog = [];

    day.exercises.forEach((ex, exIdx) => {
      const key = `${planId}-${dayIdx}-${exIdx}`;
      if (completedExercises[key]) {
        entriesToLog.push({
          name: ex.name,
          reps: Number(ex.reps?.split('-')[0]) || 0,
          weight: Number(ex.weight) || 0,
          workoutName: `${plan.name} - ${day.name}`
        });
      }
    });
    if (entriesToLog.length === 0) return;

    try {
      await api.post('/workouts/log', { exercises: entriesToLog });

      if (onClearDayExercises) {
        onClearDayExercises(planId, dayIdx);
      }
    } catch (e) {
      console.error('Erro ao registrar treino:', e);
    }
  };

  const startHold = () => {
    timerRef.current = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timerRef.current);
          handleConfirm();
          return 100;
        }
        return prev + 1.8;
      });
    }, 16);
  };

  const stopHold = () => {
    clearInterval(timerRef.current);
    if (holdProgress < 100) setHoldProgress(0);
  };

  const handleConfirm = () => {
    if (confirmTarget.type === 'plan') {
      onDeletePlan(confirmTarget.id);
    } else if (confirmTarget.type === 'exercise') {
      onDeleteExercise(confirmTarget.planId, confirmTarget.day, confirmTarget.exercise);
    } else if (confirmTarget.type === 'day') {
      onDeleteDay(confirmTarget.planId, confirmTarget.dayName);
    }
    setTimeout(() => {
      setConfirmTarget(null);
      setHoldProgress(0);
    }, 400);
  };

  const handleAddNewEx = async (e) => {
    e.preventDefault();
    if (!newExData.name || !newExData.sets) return;
    await onAddExercise(plan._id || plan.id, addingToDay, {
      ...newExData,
      sets: Number(newExData.sets),
      weight: Number(newExData.weight) || 0,
    });
    setAddingToDay(null);
    setNewExData({ name: '', sets: '', reps: '', weight: '' });
  };

  const handleAddNewDay = async (e) => {
    e.preventDefault();
    if (!newDayTitle.trim()) return;
    await onAddDay(plan._id || plan.id, newDayTitle);
    setAddingNewDay(false);
    setNewDayTitle('');
  };

  const handleSyncPR = async (dayName, exName, exData) => {
    setSyncingPR(exName);
    try {
      const response = await api.get('/workouts/pr', {
        params: { exercise: exName.trim() },
      });

      const prWeight = response.data.personalRecord || response.data.weight || 0;

      if (!prWeight || Number(prWeight) <= 0) {
        setSyncingPR(null);
        return;
      }

      if (isGenerated) {
        await api.put('/workouts/update-pr', {
          workoutId: plan._id || plan.id,
          exerciseName: exName,
          newPR: Number(prWeight),
        });
      } else {
        await api.put(
          `/workout-plans/${plan._id || plan.id}/${dayName}/${encodeURIComponent(exName)}`,
          {
            ...exData,
            weight: Number(prWeight),
          }
        );
      }

      console.log('PR atualizado, chamando onForceRefresh...');
      if (onForceRefresh) {
        await onForceRefresh();
        console.log('onForceRefresh finalizado');
      }

    } catch (e) {
      console.error('Erro ao sincronizar PR', e);
    } finally {
      setSyncingPR(null);
    }
  };

  return (
    <div
      className={`space-y-8 sm:space-y-10 animate-in fade-in slide-in-from-right-6 duration-500 pb-28 relative`}
    >

      {/* MODAL ADICIONAR EXERCÍCIO */}
      {addingToDay && !isGenerated && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-black/90 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[#111111] border border-white/5 p-5 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] w-full max-w-[95%] sm:max-w-[420px] space-y-6 sm:space-y-8 shadow-2xl">
            <div className="space-y-2 text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#ff6600]/10 text-[#ff6600] rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Plus size={20} className="sm:size-[24px]" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black italic uppercase tracking-tighter text-white">
                Novo Exercício
              </h3>
              <p className="text-gray-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                Adicionando ao plano de {addingToDay}
              </p>
            </div>
            <form onSubmit={handleAddNewEx} className="space-y-4 sm:space-y-5">
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] sm:text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">
                    Nome
                  </label>
                  <input
                    autoFocus
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 sm:p-4 text-white text-sm sm:text-base focus:border-[#ff6600] outline-none"
                    value={newExData.name}
                    onChange={(e) => setNewExData({ ...newExData, name: e.target.value })}
                    placeholder="Ex: Supino Reto"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[8px] sm:text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">
                      Séries
                    </label>
                    <input
                      type="number"
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 sm:p-4 text-white text-center focus:border-[#ff6600] outline-none no-spinners text-sm sm:text-base"
                      value={newExData.sets}
                      onChange={(e) => setNewExData({ ...newExData, sets: e.target.value })}
                      placeholder="4"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] sm:text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">
                      Reps
                    </label>
                    <input
                      className="w-full bg-black/50 border border-white/10 rounded-xl p-3 sm:p-4 text-white text-center focus:border-[#ff6600] outline-none text-sm sm:text-base"
                      value={newExData.reps}
                      onChange={(e) => setNewExData({ ...newExData, reps: e.target.value })}
                      placeholder="12"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] sm:text-[10px] uppercase font-black text-gray-500 tracking-widest ml-1">
                      Carga
                    </label>
                    <input
                      type="number"
                      className="w-full bg-black/50 border border-[#ff6600]/20 rounded-xl p-3 sm:p-4 text-[#ff6600] font-black text-center focus:border-[#ff6600] outline-none no-spinners text-sm sm:text-base"
                      value={newExData.weight}
                      onChange={(e) => setNewExData({ ...newExData, weight: e.target.value })}
                      placeholder="KG"
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center gap-3 pt-2 sm:pt-4">
                <button
                  type="submit"
                  className="px-15 py-3 sm:px-10 sm:py-3.5 bg-[#ff6600] text-black font-black uppercase text-[9px] sm:text-[10px] tracking-widest rounded-xl hover:bg-[#ff5500] transition-all shadow-[0_0_20px_rgba(255,102,0,0.9)] active:scale-95"
                >
                  Adicionar
                </button>
                <button
                  type="button"
                  onClick={() => setAddingToDay(null)}
                  className="py-2 text-gray-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors"
                >
                  Voltar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmTarget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/98 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
          <div className="relative p-[2px] rounded-[32px] overflow-hidden w-full max-w-[340px] transition-all duration-300 my-auto">

            <div
              className="absolute inset-0 transition-opacity duration-300"
              style={{
                opacity: holdProgress > 0 ? 0.8 : 0,
                background: `conic-gradient(from 0deg, #dc2626 ${holdProgress}%, transparent ${holdProgress}%)`,
              }}
            />

            <div className="relative bg-[#0a0a0a] p-8 rounded-[30px] z-10 border border-white/5 overflow-hidden">

              <div className="absolute -right-10 -bottom-10 opacity-10">
                {confirmTarget.type === 'plan' ? (
                  <Dumbbell size={140} strokeWidth={1} className="text-[#dc2626]" />
                ) : confirmTarget.type === 'day' ? (
                  <Zap size={140} strokeWidth={1} className="text-[#dc2626]" />
                ) : (
                  <Flame size={140} strokeWidth={1} className="text-[#dc2626]" />
                )}
              </div>

              <button
                onClick={() => {
                  setConfirmTarget(null);
                  setHoldProgress(0);
                  if (timerRef.current) clearInterval(timerRef.current);
                }}
                className="absolute top-6 right-6 text-gray-600 hover:text-[#dc2626] transition-colors z-20"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col items-center text-center relative z-10">
                <div className={`mb-6 h-16 w-16 rounded-2xl bg-red-900/20 border border-red-800/30 flex items-center justify-center transition-all duration-500 ${holdProgress > 0 ? 'text-[#dc2626] shadow-[0_0_20px_rgba(220,38,38,0.3)] scale-105' : 'text-red-700'}`}>
                  <Trash2 size={28} strokeWidth={1.5} />
                </div>

                <h3 className="text-xl font-black text-white tracking-tighter uppercase">
                  {confirmTarget.type === 'plan' ? 'EXCLUIR PLANO?' :
                    confirmTarget.type === 'day' ? 'EXCLUIR DIA?' :
                      'EXCLUIR EXERCÍCIO?'}
                </h3>

                <p className="mt-3 text-[12px] text-gray-500 leading-relaxed font-medium">
                  {confirmTarget.type === 'plan' ? 'Todos os dias e exercícios serão perdidos.' :
                    confirmTarget.type === 'day' ? 'Os exercícios deste dia serão removidos.' :
                      'Este exercício será removido permanentemente.'}
                </p>
              </div>

              <div className="mt-8 relative z-10">
                <button
                  onMouseDown={startHold}
                  onMouseUp={stopHold}
                  onMouseLeave={stopHold}
                  onTouchStart={startHold}
                  onTouchEnd={stopHold}
                  className={`relative w-full h-14 rounded-2xl border bg-black/80 border-white/5 transition-all duration-300 select-none cursor-pointer overflow-hidden
              ${holdProgress > 0
                      ? 'shadow-[0_0_40px_rgba(220,38,38,0.2)] scale-[0.98] border-[#dc2626]/50'
                      : 'shadow-none'
                    }`}
                >
                  <div
                    className="absolute inset-y-0 left-0 bg-[#dc2626] transition-all duration-75 ease-linear shadow-[5px_0_15px_rgba(0,0,0,0.3)]"
                    style={{ width: `${holdProgress}%` }}
                  />

                  <span className={`relative z-10 text-[11px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${holdProgress > 50 ? 'text-white' : 'text-gray-400'}`}>
                    {holdProgress >= 100 ? 'EXCLUÍDO' : 'EXCLUIR'}
                  </span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR EXERCÍCIO */}
      {editingExercise && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[#111111] border border-white/5 p-6 rounded-2xl w-full max-w-[420px] space-y-6 shadow-2xl">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-[#ff6600]/10 text-[#ff6600] rounded-2xl flex items-center justify-center mx-auto mb-2">
                <Edit3 size={24} />
              </div>
              <h3 className="text-xl font-black italic uppercase tracking-tighter text-white">
                EDITAR EXERCÍCIO
              </h3>
              <p className="text-gray-500 text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                MODIFIQUE OS PARÂMETROS DO EXERCÍCIO
              </p>
            </div>

            <div className="space-y-4">
              {!isGenerated ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                      Nome do Exercício
                    </label>
                    <input
                      autoFocus
                      className="w-full bg-black/40 border border-[#ff6600]/30 rounded-xl p-3.5 text-white font-black uppercase italic outline-none focus:border-[#ff6600] text-sm"
                      value={editingExercise.data.name}
                      onChange={(e) => setEditingExercise({ ...editingExercise, data: { ...editingExercise.data, name: e.target.value } })}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                        Séries
                      </label>
                      <input
                        type="number"
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-center text-white font-black text-sm outline-none no-spinners"
                        value={editingExercise.data.sets}
                        onChange={(e) => setEditingExercise({ ...editingExercise, data: { ...editingExercise.data, sets: Number(e.target.value) } })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                        Reps
                      </label>
                      <input
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-3.5 text-center text-white font-black text-sm outline-none"
                        value={editingExercise.data.reps}
                        onChange={(e) => setEditingExercise({ ...editingExercise, data: { ...editingExercise.data, reps: e.target.value } })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                        Carga (KG)
                      </label>
                      <input
                        type="number"
                        className="w-full bg-black/40 border border-[#ff6600]/20 rounded-xl p-3.5 text-center text-[#ff6600] font-black text-sm outline-none no-spinners"
                        value={editingExercise.data.weight}
                        onChange={(e) => setEditingExercise({ ...editingExercise, data: { ...editingExercise.data, weight: Number(e.target.value) } })}
                      />
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#ff6600] uppercase tracking-widest ml-1">
                    Recorde Pessoal (KG)
                  </label>
                  <input
                    type="number"
                    autoFocus
                    className="w-full bg-black/60 border border-[#ff6600]/20 rounded-xl p-4 text-center text-[#ff6600] font-black text-3xl outline-none no-spinners"
                    value={editingExercise.data.weight}
                    onChange={(e) => setEditingExercise({ ...editingExercise, data: { ...editingExercise.data, weight: Number(e.target.value) } })}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  onUpdateExercise(plan._id || plan.id, editingExercise.day, editingExercise.exerciseName, editingExercise.data, isGenerated);
                  setEditingExercise(null);
                }}
                className="px-12 py-3 sm:px-16 sm:py-3.5 bg-[#ff6600] text-black font-black uppercase text-[9px] sm:text-[10px] tracking-widest rounded-xl hover:bg-[#ff5500] transition-all shadow-[0_0_20px_rgba(255,102,0,0.9)] active:scale-95"  >
                SALVAR
              </button>
              <button
                onClick={() => setEditingExercise(null)}
                className="py-2 text-gray-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CABEÇALHO DO PLANO */}
      <div className="flex items-center justify-between px-2 gap-2 sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-6 overflow-hidden flex-1 min-w-0">
          <button
            onClick={onBack}
            className="p-2 sm:p-3 bg-white/5 rounded-xl sm:rounded-2xl text-gray-500 hover:text-white hover:bg-white/10 transition-all active:scale-90 flex-shrink-0"
          >
            <ArrowLeft size={20} className="sm:size-[28px]" />
          </button>
          <div className="group relative overflow-hidden flex-1 min-w-0">
            {editingPlanName !== null && !isGenerated ? (
              <div className="flex items-center gap-2 sm:gap-3 w-full">
                <input
                  autoFocus
                  className="bg-transparent text-xl sm:text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white border-b-2 border-[#ff6600] outline-none flex-1 min-w-0 w-full"
                  value={editingPlanName}
                  onChange={(e) => setEditingPlanName(e.target.value)}
                />
                <button
                  onClick={() => {
                    onUpdatePlanName(plan._id || plan.id, editingPlanName);
                    setEditingPlanName(null);
                  }}
                  className="p-1.5 sm:p-2 text-[#ff6600] flex-shrink-0"
                >
                  <Check size={18} className="sm:size-[24px]" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4 overflow-hidden flex-wrap sm:flex-nowrap">
                <h1 className="text-xl sm:text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-tight break-words">
                  {plan.name}
                </h1>
                {!isGenerated && (
                  <button
                    onClick={() => setEditingPlanName(plan.name)}
                    className="p-1.5 sm:p-2 bg-white/5 rounded-lg sm:rounded-xl text-gray-400 hover:text-[#ff6600] transition-all flex-shrink-0"
                  >
                    <Edit3 size={10} />
                  </button>
                )}
              </div>
            )}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-2 sm:mt-3">
              {/* PLANOS AUTOMÁTICOS - Arena Mode + frase antiga */}
              {isGenerated && (
                <div className="flex items-center gap-1">
                  <div className="px-2 py-0.5 sm:px-3 sm:py-1 bg-[#ff6600] text-black text-[8px] sm:text-[9px] font-black uppercase tracking-widest rounded-full italic">
                    FRANGO STUDIO
                  </div>
                  <span className="text-[9px] sm:text-[9px] font-bold text-gray-500 uppercase tracking-wider">
                    auto-treinos
                  </span>
                </div>
              )}

              {/* PLANOS MANUAIS - ID DO PLANO + código + botão */}
              {!isGenerated && (
                <>
                  <div className="px-2 py-0.5 sm:px-3 sm:py-1 bg-[#ff6600] text-black text-[8px] sm:text-[9px] font-black uppercase tracking-widest rounded-full italic">
                    ID DO PLANO:
                  </div>

                  {plan.shareCode && (
                    <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-md pl-2 pr-1.5 py-0.5 transition-all duration-200">
                      <span className={`text-[12px] sm:text-[9px] font-mono font-bold text-gray-300 tracking-wider transition-all duration-200 ${copied ? 'scale-110 text-[#ff6600]' : ''}`}>
                        {plan.shareCode}
                      </span>
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(plan.shareCode);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 300);
                        }}
                        className={`p-0.5 rounded text-gray-500 hover:text-[#ff6600] transition-all duration-200 ${copied ? 'scale-125 text-[#ff6600]' : 'hover:scale-110'}`}
                        title="Copiar código"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setConfirmTarget({ type: 'plan', id: plan._id || plan.id })}
          className="text-gray-500 hover:text-red-500 transition-all flex-shrink-0"
        >
          <Trash2 size={18} className="sm:size-[24px]" />
        </button>
      </div>
      {/* DIAS DO PLANO */}
      <div className="grid gap-8 sm:gap-12">
        {plan.days?.map((day, dIdx) => {
          const isVisible = !!openDays[day.name];
          const hasCompletedInDay = hasDayCompletedExercises(dIdx);

          return (
            <div key={dIdx} className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-2 sm:gap-4 px-2 group/day overflow-hidden">
                <div className="h-px flex-grow bg-white/5"></div>
                <div className="flex items-center gap-2 sm:gap-3 overflow-hidden flex-wrap sm:flex-nowrap">
                  {!isGenerated && (
                    <div className="flex flex-col gap-1 transition-opacity flex-shrink-0">
                      <button
                        disabled={dIdx === 0}
                        onClick={() => onReorderDays(plan._id || plan.id, dIdx, 'up')}
                        className="text-gray-600 hover:text-[#ff6600] disabled:opacity-0"
                      >
                        <ChevronUp size={12} className="sm:size-[14px]" />
                      </button>
                      <button
                        disabled={dIdx === plan.days.length - 1}
                        onClick={() => onReorderDays(plan._id || plan.id, dIdx, 'down')}
                        className="text-gray-600 hover:text-[#ff6600] disabled:opacity-0"
                      >
                        <ChevronDown size={12} className="sm:size-[14px]" />
                      </button>
                    </div>
                  )}
                  {editingDayIdx === dIdx && !isGenerated ? (
                    <div className="flex items-center gap-2 max-w-full">
                      <input
                        autoFocus
                        className="bg-transparent text-lg sm:text-xl md:text-2xl font-black italic uppercase text-[#ff6600] border-b border-[#ff6600] outline-none text-center min-w-0 max-w-[120px] sm:max-w-[150px] md:max-w-none"
                        value={tempDayName}
                        onChange={(e) => setTempDayName(e.target.value)}
                      />
                      <button
                        onClick={() => {
                          onUpdateDayName(plan._id || plan.id, day.name, tempDayName);
                          setEditingDayIdx(null);
                        }}
                        className="text-[#ff6600] flex-shrink-0"
                      >
                        <Check size={16} className="sm:size-[18px]" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 sm:gap-3 overflow-hidden flex-wrap sm:flex-nowrap">
                      <button
                        onClick={() => toggleDayVisibility(day.name)}
                        className="flex items-center gap-2 sm:gap-3 group/title flex-shrink-0"
                      >
                        <h3 className="text-lg sm:text-xl md:text-2xl font-black italic uppercase text-[#ff6600] tracking-tight break-words transition-all">
                          {day.name}
                        </h3>
                        <div
                          className={`transition-transform duration-300 ${isVisible ? 'rotate-180' : ''} flex-shrink-0`}
                        >
                          <ChevronDown
                            size={16}
                            className="sm:size-[20px] text-[#ff6600]/40 group-hover/title:text-[#ff6600]"
                          />
                        </div>
                      </button>
                      {!isGenerated && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => {
                              setEditingDayIdx(dIdx);
                              setTempDayName(day.name);
                            }}
                            className="p-1 text-gray-600 hover:text-white transition-all"
                          >
                            <Edit3 size={12} className="sm:size-[14px]" />
                          </button>
                          <button
                            onClick={() =>
                              setConfirmTarget({
                                type: 'day',
                                planId: plan._id || plan.id,
                                dayName: day.name,
                              })
                            }
                            className="p-1 text-gray-600 hover:text-red-500 transition-all"
                          >
                            <Trash2 size={12} className="sm:size-[14px]" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="h-px flex-grow bg-white/5"></div>
              </div>

              {isVisible && (
                <>
                  <div className="grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-2 animate-in fade-in slide-in-from-top-4 duration-500 ease-out">
                    {day.exercises?.map((ex, eIdx) => {
                      const checkKey = `${plan._id || plan.id}-${dIdx}-${eIdx}`;
                      const isCompleted = !!completedExercises[checkKey];
                      const DecorativeIcon =
                        eIdx % 3 === 0 ? Dumbbell : eIdx % 3 === 1 ? Zap : Flame;

                      return (
                        <div
                          key={eIdx}
                          className={`group relative min-h-[140px] sm:min-h-[150px] rounded-2xl border overflow-hidden transition-all duration-300 w-full ${isCompleted ? 'border-[#ff6600] scale-[0.99] shadow-[0_0_20px_rgba(255,102,0,0.15)] bg-[#050505]' : 'border-white/20 bg-white/[0.03] hover:border-[#ff6600]/40 shadow-lg'}`}
                        >
                          <div
                            className={`absolute inset-0 transition-colors duration-500 ${isCompleted ? 'bg-[#050505]' : 'bg-gradient-to-br from-[#0a0a0a] via-black to-[#0d0d0d] group-hover:via-[#111111]'}`}
                          />
                          <div
                            className={`absolute -right-3 -bottom-4 transition-opacity duration-500 text-[#ff6600] transform rotate-12 ${isCompleted ? 'opacity-[0.1]' : 'opacity-[0.03] group-hover:opacity-[0.07]'}`}
                          >
                            <DecorativeIcon
                              size={100}
                              className="sm:size-[140px]"
                              strokeWidth={2.5}
                            />
                          </div>
                          <div
                            className={`absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 ${isCompleted ? 'bg-[#ff6600]' : 'bg-[#ff6600] opacity-30 group-hover:opacity-100 group-hover:w-2'}`}
                          />

                          <div className="relative z-10 h-full p-4 sm:p-5 flex items-center justify-between gap-3 w-full">
                            <>
                              <div
                                className="flex items-center gap-3 sm:gap-4 flex-grow min-w-0 cursor-pointer"
                                onClick={() => toggleCheck(checkKey)}
                              >
                                <div
                                  className={`flex-shrink-0 transition-all duration-300 rounded-lg ${isCompleted ? 'text-[#ff6600] scale-110 drop-shadow-[0_0_8px_#ff6600]' : 'text-white/20 group-hover:text-[#ff6600]/50 group-hover:scale-110'}`}
                                >
                                  <CheckSquare
                                    className="w-6 h-6 sm:w-7 sm:h-7"
                                    strokeWidth={2.5}
                                  />
                                </div>
                                <div className="space-y-2 min-w-0 overflow-hidden flex-1">
                                  <h4
                                    className={`text-base sm:text-lg md:text-xl font-black uppercase italic tracking-tight transition-all truncate leading-normal py-1 ${isCompleted ? 'text-[#ff6600]' : 'text-white group-hover:text-[#ff6600]'}`}
                                  >
                                    {ex.name}
                                  </h4>

                                  <div className="flex items-start gap-4 sm:gap-8">
                                    <div className="flex flex-col">
                                      <p className="text-[8px] sm:text-[9px] font-black text-gray-500 uppercase tracking-widest leading-[1.2]">
                                        SÉRIES
                                      </p>
                                      <p
                                        className={`text-base sm:text-lg md:text-xl font-black italic transition-colors leading-tight ${isCompleted ? 'text-[#ff6600]' : 'text-white'}`}
                                      >
                                        {ex.sets}
                                      </p>
                                    </div>
                                    <div className="flex flex-col">
                                      <p className="text-[8px] sm:text-[9px] font-black text-gray-500 uppercase tracking-widest leading-[1.2]">
                                        REPS
                                      </p>
                                      <p
                                        className={`text-base sm:text-lg md:text-xl font-black italic transition-colors leading-tight ${isCompleted ? 'text-[#ff6600]' : 'text-white'}`}
                                      >
                                        {ex.reps}
                                      </p>
                                    </div>
                                    <div className="flex flex-col relative group/pr">
                                      <p className="text-[8px] sm:text-[9px] font-black text-[#ff6600]/60 uppercase tracking-widest leading-[1.2]">
                                        CARGA
                                      </p>
                                      <div className="flex items-center gap-4 overflow-visible">
                                        <p className="text-base sm:text-lg md:text-xl font-black italic text-[#ff6600] leading-tight whitespace-nowrap overflow-visible">
                                          {ex.weight}KG
                                        </p>

                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleSyncPR(day.name, ex.name, ex);
                                          }}
                                          className={`p-1 rounded-md transition-all flex-shrink-0 ${syncingPR === ex.name
                                              ? 'animate-spin bg-[#ff6600]/20 text-[#ff6600]'
                                              : 'bg-[#ff6600]/5 hover:bg-[#ff6600]/20 text-[#ff6600]'
                                            }`}
                                          title="Sincronizar PR do Histórico"
                                        >
                                          <Trophy size={10} className="sm:size-[12px]" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col gap-1.5 flex-shrink-0">
                                {!isGenerated && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setConfirmTarget({
                                        type: 'exercise',
                                        planId: plan._id || plan.id,
                                        day: day.name,
                                        exercise: ex.name,
                                      });
                                    }}
                                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 text-gray-400 flex items-center justify-center hover:bg-red-500/10 hover:text-red-500 transition-all"
                                  >
                                    <X size={14} className="sm:size-[16px]" />
                                  </button>
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingExercise({
                                      day: day.name,
                                      exerciseName: ex.name,
                                      data: { ...ex },
                                    });
                                  }}
                                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/5 text-gray-400 flex items-center justify-center hover:bg-[#ff6600]/10 hover:text-[#ff6600] transition-all"
                                >
                                  <Edit3 size={14} className="sm:size-[16px]" />
                                </button>
                                <div
                                  className={`hidden sm:flex w-7 h-7 sm:w-8 sm:h-8 rounded-xl items-center justify-center transition-all ${isCompleted ? 'bg-[#ff6600]/20 text-[#ff6600]' : 'bg-white/5 text-white/20'}`}
                                >
                                  <Dumbbell size={14} className="sm:size-[16px]" />
                                </div>
                              </div>
                            </>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-center pt-3">
                    <div
                      onClick={() => hasCompletedInDay && handleFinishDayWorkout(dIdx)}
                      className={`transition-all cursor-pointer ${hasCompletedInDay
                          ? 'text-gray-500 hover:text-gray-300 hover:scale-105 active:scale-95'
                          : 'text-gray-900 cursor-not-allowed opacity-10'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-900" />
                        <span className="text-xs sm:text-sm font-black uppercase tracking-wider">Finalizar treino</span>
                      </div>
                    </div>
                  </div>
                  {/* BOTÃO ADICIONAR EXERCÍCIO */}
                  <div className="mt-4">
                    <button
                      onClick={() => setAddingToDay(day.name)}
                      className="w-full py-3 sm:py-6 border-2 border-dashed border-white/5 rounded-[1.5rem] sm:rounded-[2rem] text-[12px] sm:text-[10px] font-black uppercase transition-all flex items-center justify-center gap-2 sm:gap-3 group cursor-pointer text-gray-500 hover:border-[#ff6600] hover:text-[#ff6600]"
                    >
                      <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-white/5 flex items-center justify-center transition-all group-hover:bg-[#ff6600] group-hover:text-black">
                        <Plus size={12} strokeWidth={3} className="sm:size-[18px]" />
                      </div>
                      Adicionar Exercício
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {!isGenerated && (
          <div className="pt-4 px-2">
            {addingNewDay ? (
              <form
                onSubmit={handleAddNewDay}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 bg-white/[0.03] p-3 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-dashed border-[#ff6600]/30 animate-in fade-in zoom-in-95"
              >
                <input
                  autoFocus
                  className="bg-transparent text-base sm:text-xl font-black italic uppercase text-[#ff6600] border-b border-[#ff6600] outline-none flex-1 min-w-0 px-2 py-2"
                  placeholder="NOME DO DIA"
                  value={newDayTitle}
                  onChange={(e) => setNewDayTitle(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAddingNewDay(false)}
                    className="p-2 text-gray-500 hover:text-white"
                  >
                    <X size={18} className="sm:size-[20px]" />
                  </button>
                  <button type="submit" className="p-2 text-[#ff6600]">
                    <Check size={20} className="sm:size-[24px]" />
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setAddingNewDay(true)}
                className="w-full py-3 sm:py-6 border-2 border-dashed border-white/5 rounded-[1.5rem] sm:rounded-[2rem] text-[12px] sm:text-[10px] font-black uppercase text-gray-600 hover:border-[#ff6600] hover:text-[#ff6600] transition-all flex items-center justify-center gap-2 sm:gap-3 group"
              >
                <div className="w-5 h-5 sm:w-8 sm:h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-[#ff6600] group-hover:text-black transition-all">
                  <Plus size={12} strokeWidth={3} className="sm:size-[18px]" />
                </div>
                Adicionar dia
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};