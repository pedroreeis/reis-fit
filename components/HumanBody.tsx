import React, { useMemo } from 'react';

interface HumanBodyProps {
  muscleCounts: { [key: string]: number };
}

// Mapeia o nome do músculo para o ID no SVG
const muscleToIdMap: { [key: string]: string[] } = {
    'Peito': ['chest'],
    'Abdômen': ['abs'],
    'Ombros': ['shoulders_front', 'shoulders_back'],
    'Trapézio': ['traps'],
    'Bíceps': ['biceps'],
    'Antebraço': ['forearms_front', 'forearms_back'],
    'Quadríceps': ['quads'],
    'Panturrilhas': ['calves_front', 'calves_back'],
    'Costas': ['lats', 'upper_back', 'lower_back', 'traps'],
    'Lombar': ['lower_back'],
    'Glúteos': ['glutes'],
    'Tríceps': ['triceps'],
    'Isquiotibiais': ['hamstrings'],
    // Mapeamentos compostos
    'Pernas': ['quads', 'hamstrings', 'calves_front', 'calves_back', 'glutes']
};

const SvgBody: React.FC<{ muscleStyle: (id: string) => React.CSSProperties, getMuscleInfo: (id: string) => { name: string, count: number } | null }> = ({ muscleStyle, getMuscleInfo }) => {
  const MusclePath: React.FC<{ id: string, d: string }> = ({ id, d }) => {
    const info = getMuscleInfo(id);
    return (
      <path id={id} d={d} style={muscleStyle(id)} className="transition-all duration-300 cursor-pointer hover:stroke-blue-300 hover:stroke-2 hover:opacity-100">
        {info && <title>{`${info.name}: ${info.count} treino(s)`}</title>}
      </path>
    );
  };

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="100%" height="auto" className="mx-auto">
      {/* --- FRONT VIEW --- */}
      <g id="front-view" transform="translate(50, 20)">
        <text x="75" y="480" textAnchor="middle" className="font-sans text-lg fill-current text-slate-400">Frente</text>
        {/* Head */}
        <path d="M75,20 a25,28 0 0,1 0,56 a25,28 0 0,1 0,-56" fill="#334155" opacity="0.5" />
        {/* Neck */}
        <path d="M65,76 h20 v20 H65 z" fill="#334155" opacity="0.5" />
        <MusclePath id="shoulders_front" d="M35,96 a50,50 0 0,1 80,0 L125,120 H25 L35,96 z" />
        <MusclePath id="chest" d="M45,120 h60 v50 H45 z" />
        <MusclePath id="biceps" d="M25,120 l-10,60 h20 l5,-60 h-15 z M125,120 l10,60 h-20 l-5,-60 h15 z" />
        <MusclePath id="forearms_front" d="M15,180 l-5,70 h20 l5,-70 h-20 z M135,180 l5,70 h-20 l-5,-70 h20 z" />
        <MusclePath id="abs" d="M55,170 h40 v60 H55 z" />
        <MusclePath id="quads" d="M40,240 l-10,130 h40 v-130 h-30 z M110,240 l10,130 h-40 v-130 h30 z" />
        <MusclePath id="calves_front" d="M35,380 l-5,70 h20 l-5,-70 h-10 z M120,380 l5,70 h-20 l5,-70 h10 z" />
      </g>
      
      {/* --- BACK VIEW --- */}
      <g id="back-view" transform="translate(200, 20)">
        <text x="75" y="480" textAnchor="middle" className="font-sans text-lg fill-current text-slate-400">Costas</text>
        {/* Head */}
        <path d="M75,20 a25,28 0 0,1 0,56 a25,28 0 0,1 0,-56" fill="#334155" opacity="0.5" />
        {/* Neck */}
        <path d="M65,76 h20 v15 H65 z" fill="#334155" opacity="0.5" />
        <MusclePath id="traps" d="M45,91 l30,-15 l30,15 v30 H45 z" />
        <MusclePath id="shoulders_back" d="M35,96 a50,50 0 0,1 80,0 L125,120 H25 L35,96 z" />
        <MusclePath id="upper_back" d="M45,121 h60 v40 H45 z" />
        <MusclePath id="lats" d="M40,161 l-5,50 h80 l-5,-50 H40 z" />
        <MusclePath id="lower_back" d="M55,211 h40 v40 H55 z" />
        <MusclePath id="triceps" d="M25,120 l-10,60 h20 l5,-60 h-15 z M125,120 l10,60 h-20 l-5,-60 h15 z" />
        <MusclePath id="forearms_back" d="M15,180 l-5,70 h20 l5,-70 h-20 z M135,180 l5,70 h-20 l-5,-70 h20 z" />
        <MusclePath id="glutes" d="M40,251 a40,40 0 0,1 70,0 v40 H40 z" />
        <MusclePath id="hamstrings" d="M40,291 l-5,80 h40 v-80 h-35 z M105,291 l5,80 h-40 v-80 h35 z" />
        <MusclePath id="calves_back" d="M40,380 l-5,70 h20 l-5,-70 h-10 z M115,380 l5,70 h-20 l5,-70 h10 z" />
      </g>
    </svg>
  );
};

const HumanBody: React.FC<HumanBodyProps> = ({ muscleCounts }) => {

  const { maxCount, idToMuscleMap } = useMemo(() => {
    let max = 0;
    const idMap: { [key: string]: { name: string, count: number } } = {};
    
    for (const muscleName in muscleCounts) {
      const count = muscleCounts[muscleName];
      if (count > max) {
        max = count;
      }
      if (muscleToIdMap[muscleName]) {
        muscleToIdMap[muscleName].forEach(id => {
          if (!idMap[id] || idMap[id].count < count) {
              idMap[id] = { name: muscleName, count };
          }
        });
      }
    }
    // Set a minimum maxCount to prevent division by zero and have a baseline intensity
    return { maxCount: Math.max(1, max), idToMuscleMap: idMap };
  }, [muscleCounts]);

  const getMuscleStyle = (muscleId: string): React.CSSProperties => {
    const muscleInfo = idToMuscleMap[muscleId];
    const baseFill = '#475569'; // slate-600
    const highlightFill = '#3b82f6'; // blue-500
    
    if (muscleInfo) {
      const intensity = muscleInfo.count / maxCount;
      // Opacidade mínima de 0.2 para que mesmo o menos trabalhado seja visível
      const opacity = 0.2 + (intensity * 0.8);
      return { fill: highlightFill, opacity };
    }
    
    return { fill: baseFill, opacity: 0.3 };
  };

  const getMuscleInfo = (muscleId: string) => {
    return idToMuscleMap[muscleId] || null;
  };
  
  return <SvgBody muscleStyle={getMuscleStyle} getMuscleInfo={getMuscleInfo} />;
};

export default HumanBody;
