import React from 'react';
import { Trash2 } from 'lucide-react';

export const DayAccordion = ({ register, dayIndex, removeDay }) => {
  return (
    <div className="bg-black/40 border border-white/5 rounded-2xl p-4">
      <div className="flex items-center justify-between gap-3">
        <input
          {...register(`days.${dayIndex}.name`)}
          placeholder="Ex: Peito e tríceps"
          className="bg-transparent text-lg font-black italic uppercase tracking-tight text-[#ff6600] outline-none border-b border-[#ff6600]/30 focus:border-[#ff6600] flex-1"
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => removeDay(dayIndex)}
          className="text-gray-500 hover:text-red-500 transition-all"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};