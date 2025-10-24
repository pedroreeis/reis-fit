import React, { useState, useEffect } from 'react';
import { getWorkouts, deleteWorkout } from '../services/db';
import { Workout, WorkoutCategory } from '../types';
import Icon from '../components/Icon';

interface WorkoutsProps {
  onNewWorkout: () => void;
  onEditWorkout: (workout: Workout) => void;
  onStartWorkout: (workout: Workout) => void;
}

const categoryStyles: { [key in WorkoutCategory | 'default']: { bg: string, text: string, border: string } } = {
  'A': { bg: 'bg-red-50 dark:bg-red-900/40', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' },
  'B': { bg: 'bg-blue-50 dark:bg-blue-900/40', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
  'C': { bg: 'bg-green-50 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
  'D': { bg: 'bg-yellow-50 dark:bg-yellow-900/40', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800' },
  'Full Body': { bg: 'bg-indigo-50 dark:bg-indigo-900/40', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' },
  '': { bg: 'bg-white dark:bg-slate-800', text: 'text-gray-800 dark:text-slate-100', border: 'dark:border-slate-700' },
  'default': { bg: 'bg-white dark:bg-slate-800', text: 'text-gray-800 dark:text-slate-100', border: 'dark:border-slate-700' },
};


const Workouts: React.FC<WorkoutsProps> = ({ onNewWorkout, onEditWorkout, onStartWorkout }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    loadWorkouts();
  }, []);

  async function loadWorkouts() {
    const data = await getWorkouts();
    setWorkouts(data);
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja apagar este treino?')) {
      await deleteWorkout(id);
      loadWorkouts();
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
            <Icon name="Dumbbell" size={20} className="text-gray-400 dark:text-gray-500" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Meus Treinos</h1>
        </div>
        <button
          onClick={onNewWorkout}
          className="bg-blue-500 text-white font-bold p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
        >
          <Icon name="Plus" size={24} />
        </button>
      </div>

      {workouts.length > 0 ? (
        workouts.map((workout) => {
          const styles = categoryStyles[workout.category || ''] || categoryStyles.default;
          const totalExercises = workout.exerciseGroups?.reduce((sum, group) => sum + group.exercises.length, 0) || 0;

          return (
            <div key={workout.id} className={`p-4 rounded-lg shadow-md border ${styles.bg} ${styles.border}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                   {workout.category && (
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${styles.text}`} style={{ backgroundColor: styles.bg.replace('bg-opacity-40', 'bg-opacity-100') }}>
                        TREINO {workout.category}
                      </span>
                    )}
                  <h2 className={`font-bold text-lg mt-1 ${styles.text}`}>{workout.name}</h2>
                  
                  {workout.muscleGroups && workout.muscleGroups.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                          {workout.muscleGroups.map(group => (
                              <span key={group} className="text-xs bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-slate-300 px-2 py-1 rounded-full">{group}</span>
                          ))}
                      </div>
                  )}

                  <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">{totalExercises} exercícios</p>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => onEditWorkout(workout)} className="p-2 text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400">
                    <Icon name="Edit" size={20} />
                  </button>
                  <button onClick={() => handleDelete(workout.id)} className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500">
                    <Icon name="Trash2" size={20} />
                  </button>
                </div>
              </div>
              <button
                onClick={() => onStartWorkout(workout)}
                className="mt-4 w-full bg-green-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
              >
                <Icon name="Play" size={18} />
                <span>Iniciar Treino</span>
              </button>
            </div>
          )
        })
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500 dark:text-slate-400">Nenhum treino criado ainda.</p>
          <button onClick={onNewWorkout} className="mt-4 bg-blue-500 text-white font-bold py-2 px-4 rounded-lg">
            Criar meu primeiro treino
          </button>
        </div>
      )}
    </div>
  );
};

export default Workouts;
