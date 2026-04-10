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
      title: 'Max Carga',
      value: `${safeStats.maxWeight}kg`,
      icon: Trophy,
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800',
      onClick: () => setIsPRSearchOpen(true),
      position: 'bg-center',
    },
    {
      title: 'Volume Total',
      value: `${safeStats.sessionVolume}kg`,
      icon: Activity,
      image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=800',
      position: 'bg-center',
    },
    {
  title: 'Exercícios Concluídos',
  value: (
    <div className="flex items-baseline gap-1.5">
      <span className="text-3xl font-black text-white italic tracking-tighter leading-none">
        {safeStats.completedCount}
      </span>
      <span className="text-[10px] font-black text-white/100 uppercase tracking-[0.15em] italic">
        Exercícios
      </span>
    </div>
  ),
  icon: CheckSquare,
  image: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=800',
  position: 'bg-center',
},
    {
      title: 'Planos',
      value:
        (Array.isArray(plans) ? plans.length : 0) +
        (Array.isArray(generatedWorkouts) ? generatedWorkouts.length : 0),
      icon: ClipboardList,
      image: 'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=800',
      position: 'bg-top',
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
            <div className="flex flex-col text-left min-w-0">
              <p className="text-[10px] text-[#ff6600] uppercase tracking-wider font-black opacity-90 truncate">
                {card.title}
              </p>
              <div className="text-xl font-black text-white italic uppercase tracking-tighter truncate drop-shadow-lg">
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