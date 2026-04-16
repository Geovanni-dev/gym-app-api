import React from 'react';
import { Trophy, Activity, CheckSquare, ClipboardList, Dumbbell, ChevronRight } from 'lucide-react';

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
      title: 'GYM RATS',
      value: 'SUPER FRANGO',
      icon: Dumbbell,
      image: '/images/logo-gymrats2.jpg',
      position: 'bg-center',
      isGymRats: true,
      onClick: () => window.open('https://share.gymrats.app/join?code=AMKWULSI', '_blank'),
    },
    {
      title: 'EXERCÍCIOS',
      value: (
        <div className="flex items-baseline gap-1.5">
          <span className="text-[17px] font-black text-white italic tracking-tighter">
            {safeStats.completedCount}
          </span>
          <span className="text-base font-black text-white uppercase tracking-[0.15em]">
           CONCLUÍDOS
          </span>
        </div>
      ),
      icon: CheckSquare,
      image: 'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      position: 'bg-top',
    },
    {
      title: 'MAX CARGA',
      value: `${safeStats.maxWeight}kg`,
      icon: Trophy,
      image: 'https://images.unsplash.com/photo-1546817372-628669db4655?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      onClick: () => setIsPRSearchOpen(true),
      position: 'bg-[position:50%_20%]',
    },
    {
      title: 'VOLUME TOTAL',
      value: `${safeStats.sessionVolume}kg`,
      icon: Activity,
      image: 'https://images.unsplash.com/photo-1621750627159-cf77b0b91aac?q=80&w=1331&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      position: 'bg-center',
    },
    {
      title: 'PLANOS',
      value:
        (Array.isArray(plans) ? plans.length : 0) +
        (Array.isArray(generatedWorkouts) ? generatedWorkouts.length : 0),
      icon: ClipboardList,
      image: 'https://images.unsplash.com/photo-1574680178050-55c6a6a96e0a?q=80&w=800',
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
         <div
  className={`absolute inset-0 bg-cover ${card.position} transition-all duration-1000 ${
    card.isGymRats 
      ? 'grayscale-0 group-hover:grayscale' 
      : 'grayscale brightness-[0.7] contrast-[1.1] group-hover:grayscale-0 group-hover:brightness-[0.9]'
  } group-hover:scale-110`}
  style={{ backgroundImage: `url('${card.image}')` }}
/>

          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-black/30 group-hover:from-black/80 transition-all duration-500" />

          <div className="relative p-4 z-10 flex flex-row items-center gap-3 h-full">
            <div className="p-2 border border-[#ff6600]/30 rounded-lg bg-black/60 backdrop-blur-md group-hover:border-[#ff6600] flex-shrink-0">
              <card.icon
                className="text-[#ff6600] drop-shadow-[0_0_8px_rgba(255,102,0,0.6)]"
                size={20}
              />
            </div>

            <div className="flex flex-col text-left min-w-0 justify-center">
              <div className="relative inline-block mb-1 max-w-min">
                <p className="text-[12px] text-white uppercase tracking-[0.15em] font-black opacity-90 whitespace-nowrap">
                  {card.title}
                </p>
                <div className="absolute -bottom-0.5 left-0 w-0 h-[2px] bg-[#ff6600] shadow-[0_0_6px_#ff6600] transition-all duration-300 group-hover:w-full" />
              </div>
             <div className={`flex items-center gap-2 ${card.isGymRats ? 'mt-0' : '-mt-1'}`}>
  <span className="text-base font-black text-white italic uppercase tracking-tighter drop-shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:origin-left whitespace-nowrap">
    {card.value}
  </span>
  {card.isGymRats && <ChevronRight size={14} className="text-[#ff6600]" />}
</div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 h-[3px] w-0 bg-[#ff6600] shadow-[0_0_15px_#ff6600] transition-all duration-700 group-hover:w-full" />
        </div>
      ))}
    </div>
  );
};

export default MetricsGridAuto;