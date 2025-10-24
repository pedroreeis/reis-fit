import React from 'react';
import HumanBody from './HumanBody';

interface MuscleMapProps {
  muscleCounts: { [key: string]: number };
}

const MuscleMap: React.FC<MuscleMapProps> = ({ muscleCounts }) => {
  const hasData = Object.keys(muscleCounts).length > 0;

  return (
    <div className="p-4">
      <h3 className="font-semibold mb-3 text-lg text-center text-gray-800 dark:text-slate-100">Mapa de Frequência Muscular</h3>
      {hasData ? (
        <div className="w-full">
          <HumanBody muscleCounts={muscleCounts} />
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500 dark:text-slate-400">
              <span>Menos Foco</span>
              <div className="w-24 h-3 rounded-full bg-gradient-to-r from-blue-500/20 via-blue-500/60 to-blue-500"></div>
              <span>Mais Foco</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-center py-8 text-gray-500 dark:text-slate-400">
          Nenhum grupo muscular registrado no seu histórico. Complete um treino para começar!
        </p>
      )}
    </div>
  );
};

export default MuscleMap;