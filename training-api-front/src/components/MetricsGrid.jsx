import React from 'react';
import { Trophy, Activity, CheckSquare, ClipboardList } from 'lucide-react';

const MetricsGridAuto = ({
  stats = { maxWeight: 0, sessionVolume: 0, completedCount: 0 },
  plans = [],
  generatedWorkouts = [],
  setIsPRSearchOpen = () => {},
}) => {
  const safeStats = {
    maxWeight: stats?.maxWeight || 0,
    sessionVolume: stats?.sessionVolume || 0,
    completedCount: stats?.completedCount || 0,
  };

  const cards = [
    {
      title: 'EXERCÍCIOS',
      value: (
        <div className="flex items-baseline gap-1.5">
          <span className="text-xl font-black text-white italic tracking-tighter">
            {safeStats.completedCount}
          </span>
          <span className="text-sm font-black text-white uppercase tracking-[0.15em]">
            FEITOS
          </span>
        </div>
      ),
      icon: CheckSquare,
      image: 'https://images.unsplash.com/photo-1728486145245-d4cb0c9c3470?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // academia aestethic
      image: 'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      position: 'bg-top',
    },
    {
      title: 'MAX CARGA',
      value: `${safeStats.maxWeight}kg`,
      icon: Trophy,
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800', // levantamento terra
      image: 'https://images.unsplash.com/photo-1546817372-628669db4655?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',// mulher agachamento
      onClick: () => setIsPRSearchOpen(true),
      position: 'bg-[position:50%_20%]',
    },
    {
      title: 'VOLUME TOTAL',
      value: `${safeStats.sessionVolume}kg`,
      icon: Activity,
      image: 'https://images.unsplash.com/photo-1605296867424-35fc25c9212a?q=80&w=500&auto=format&fit=crop', // homem fazendo barra
      position: 'bg-center',
    },
    {
      title: 'PLANOS',
      value:
        (Array.isArray(plans) ? plans.length : 0) +
        (Array.isArray(generatedWorkouts) ? generatedWorkouts.length : 0),
      icon: ClipboardList,
      image: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?q=80&w=800', //mulher fazendo agachamento
      position: 'bg-center',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-2">
      {cards.map((card, index) => (
        <div
          key={index}
          onClick={card.onClick}
          className="relative group overflow-hidden rounded-2xl cursor-pointer transition-all duration-500 hover:scale-[1.02] border border-[#ff6600]/20 hover:border-[#ff6600] h-28"
        >
          {/* Background Image */}
          <div
            className={`absolute inset-0 bg-cover ${card.position} transition-all duration-1000 grayscale brightness-[0.7] contrast-[1.1] group-hover:grayscale-0 group-hover:brightness-[0.9] group-hover:scale-110`}
            style={{ backgroundImage: `url('${card.image}')` }}
          />

          {/* Overlay gradiente */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/30 group-hover:from-black/80 transition-all duration-500" />

          <div className="relative p-4 z-10 flex flex-row items-center gap-3 h-full">
            {/* Box do Ícone */}
            <div className="p-2 border border-[#ff6600]/30 rounded-lg bg-black/60 backdrop-blur-md group-hover:border-[#ff6600] flex-shrink-0">
              <card.icon
                className="text-[#ff6600] drop-shadow-[0_0_8px_rgba(255,102,0,0.6)]"
                size={20}
              />
            </div>

            {/* Textos */}
            <div className="flex flex-col text-left min-w-0 justify-center">
              <div className="relative mb-2">
                <p className="text-[12px] text-white uppercase tracking-[0.15em] font-black opacity-90 truncate transition-all duration-300 group-hover:scale-105 group-hover:origin-left">
                  {card.title}
                </p>
                <div className="absolute -bottom-0.5 left-0 w-0 h-[2px] bg-[#ff6600] shadow-[0_0_6px_#ff6600] transition-all duration-300 group-hover:w-full" />
              </div>
              <div className="text-xl font-black text-white italic uppercase tracking-tighter truncate drop-shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:origin-left">
                {card.value}
              </div>
            </div>
          </div>

          {/* Barra neon inferior */}
          <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#ff6600] shadow-[0_0_15px_#ff6600] transition-all duration-700 group-hover:w-full" />
        </div>
      ))}
    </div>
  );
};

export default MetricsGridAuto;
