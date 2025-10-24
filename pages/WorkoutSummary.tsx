import React, { useMemo, useState, useEffect } from 'react';
import { Session } from '../types';
import Icon from '../components/Icon';
import { formatDuration } from '../utils/helpers';
import { calculateStreak } from '../services/db';
import { Trophy } from 'lucide-react';

interface WorkoutSummaryProps {
    session: Session;
    onClose: () => void;
}

const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({ session, onClose }) => {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const fetchStreak = async () => {
        const currentStreak = await calculateStreak();
        setStreak(currentStreak);
    }
    fetchStreak();
  }, []);

  const summaryStats = useMemo(() => {
    let totalReps = 0;
    let totalSets = 0;
    let maxLoad = 0;

    session.performedExercises.forEach(ex => {
        totalSets += ex.sets.length;
        ex.sets.forEach(set => {
            totalReps += set.reps;
            if (set.load > maxLoad) {
                maxLoad = set.load;
            }
        });
    });
    
    return { totalReps, totalSets, maxLoad };
  }, [session]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 dark:bg-slate-900 p-4 text-center">
        <Trophy size={64} className="text-yellow-500 mb-4" />
        <h1 className="text-3xl font-bold text-gray-800 dark:text-slate-100">Parabéns!</h1>
        <p className="text-gray-600 dark:text-slate-300 mt-2 mb-6">Você completou o treino <span className="font-semibold">{session.workoutName}</span>.</p>

        <div className="w-full max-w-sm bg-white dark:bg-slate-800 dark:border dark:border-slate-700 p-6 rounded-lg shadow-md space-y-4">
            <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Duração</span>
                <span className="font-bold">{formatDuration(session.duration)}</span>
            </div>
             <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Carga Máxima</span>
                <span className="font-bold">{summaryStats.maxLoad} kg</span>
            </div>
             <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Total de Séries</span>
                <span className="font-bold">{summaryStats.totalSets}</span>
            </div>
             <div className="flex justify-between">
                <span className="text-gray-500 dark:text-slate-400">Total de Reps</span>
                <span className="font-bold">{summaryStats.totalReps}</span>
            </div>
             <div className="flex justify-between border-t dark:border-slate-700 pt-4 mt-4">
                <span className="text-gray-500 dark:text-slate-400">Sua Sequência</span>
                <span className="font-bold text-orange-500">{streak} dias</span>
            </div>
        </div>

        <button 
            onClick={onClose}
            className="mt-8 w-full max-w-sm bg-blue-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
        >
            Voltar para o Início
        </button>
    </div>
  )
}

export default WorkoutSummary;