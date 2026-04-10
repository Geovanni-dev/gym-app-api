import React from 'react'; // Componente de cartão de métrica que exibe um ícone, um rótulo e um valor, com suporte para cores personalizadas e clique opcional

export const MetricCard = ({ icon: Icon, label, value, colorClass = 'text-white', onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white/[0.03] backdrop-blur-md border border-white/5 p-5 rounded-2xl space-y-3 hover:border-[#ff6600]/20 transition-all group ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div className="p-2 bg-white/5 w-fit rounded-lg group-hover:bg-[#ff6600]/10 transition-colors">
      <Icon className={colorClass} size={16} />
    </div>
    <div className="space-y-0.5">
      <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1 flex items-center gap-2">
        {Icon && <Icon size={12} />} {label}
      </label>
      <div className={`text-2xl font-black italic tracking-tighter uppercase ${colorClass}`}>
        {value}
      </div>
    </div>
  </div>
);
