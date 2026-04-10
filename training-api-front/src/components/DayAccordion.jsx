import React from 'react';
// Componente de acordeão para cada dia de treino, permitindo adicionar e remover exercícios dinamicamente usando react-hook-form
import { useFieldArray } from 'react-hook-form';
import { Plus, Trash2, X } from 'lucide-react';

export const DayAccordion = ({ register, dayIndex, removeDay, control }) => {
  //'recebe as props necessárias para registrar os campos do formulário, o índice do dia, a função para remover o dia e o controle do react-hook-form
  const {
    fields: exercises,
    append,
    remove,
  } = useFieldArray({
    control,
    name: `days.${dayIndex}.exercises`,
  });

  return (
    // Estrutura do acordeão para cada dia, incluindo o nome do dia, a lista de exercícios e os botões para adicionar e remover exercícios
    <div className="bg-black/40 border border-white/5 rounded-2xl p-5 space-y-4 overflow-visible">
      <div className="flex items-center justify-between">
        <input
          {...register(`days.${dayIndex}.name`)}
          placeholder="Ex: Segunda-feira"
          className="bg-transparent text-lg font-black italic uppercase tracking-tight text-[#ff6600] outline-none border-none focus:ring-0 day-name-input"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => removeDay(dayIndex)}
          className="text-gray-500 hover:text-[#b91c1c] hover:scale-110 transition-all"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="space-y-3 overflow-visible">
        {exercises.map((ex, exIndex) => (
          <div
            key={ex.id}
            className="grid grid-cols-12 gap-2 items-end bg-white/[0.02] p-3 rounded-xl border border-white/5 overflow-visible"
          >
            <div className="col-span-12 md:col-span-5">
              <label className="text-[8px] uppercase font-bold text-gray-600 block mb-1">
                Exercício
              </label>
              <input
                {...register(`days.${dayIndex}.exercises.${exIndex}.name`)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white"
                autoComplete="off"
              />
            </div>
            <div className="col-span-3 md:col-span-2 text-center">
              <label className="text-[8px] uppercase font-bold text-gray-600 block mb-1">
                Séries
              </label>
              <input
                type="number"
                {...register(`days.${dayIndex}.exercises.${exIndex}.sets`)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white text-center no-spinners"
                autoComplete="off"
              />
            </div>
            <div className="col-span-3 md:col-span-2 text-center">
              <label className="text-[8px] uppercase font-bold text-gray-600 block mb-1">
                Reps
              </label>
              <input
                {...register(`days.${dayIndex}.exercises.${exIndex}.reps`)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-xs text-white text-center"
                autoComplete="off"
              />
            </div>
            <div className="col-span-4 md:col-span-2 text-center">
              <label className="text-[8px] uppercase font-bold text-gray-600 block mb-1">
                Peso (KG)
              </label>
              <input
                type="number"
                {...register(`days.${dayIndex}.exercises.${exIndex}.weight`)}
                className="w-full bg-black/40 border border-[#ff6600]/30 rounded-lg p-2 text-xs text-[#ff6600] font-bold text-center no-spinners"
                autoComplete="off"
              />
            </div>
            <div className="col-span-2 md:col-span-1 flex justify-center pb-2">
              <button
                type="button"
                onClick={() => remove(exIndex)}
                className="text-gray-600 hover:text-red-500 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ name: '', sets: '', reps: '', weight: '' })}
          className="w-full py-2 border-2 border-dashed border-white/5 rounded-xl text-[10px] font-black uppercase text-gray-500 hover:border-[#ff6600] hover:text-[#ff6600] transition-all flex items-center justify-center gap-2"
        >
          <Plus size={14} /> Adicionar Exercício
        </button>
      </div>
    </div>
  );
};