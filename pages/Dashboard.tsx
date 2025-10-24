import React, { useState, useEffect } from 'react';
import { UserProfile, Workout, Session, PerformedExercise } from '../types';
import { getUserProfile, getWorkouts, getSessions, calculateStreak, saveSession } from '../services/db';
import Icon from '../components/Icon';
import AnnualCalendar from '../components/WeeklyCalendar';
import Modal from '../components/Modal';
import { generateUUID } from '../utils/helpers';

interface DashboardProps {
  onStartWorkout: (workout: Workout) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onStartWorkout }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  // State for retroactive session modal
  const [isRetroModalOpen, setIsRetroModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [retroactiveWorkoutId, setRetroactiveWorkoutId] = useState<string>('');


  async function loadData() {
    try {
      setLoading(true);
      const [profileData, workoutsData, sessionsData, streakData] = await Promise.all([
        getUserProfile(),
        getWorkouts(),
        getSessions(),
        calculateStreak(),
      ]);
      setProfile(profileData || null);
      setWorkouts(workoutsData);
      setSessions(sessionsData);
      setStreak(streakData);
      if (workoutsData.length > 0 && !retroactiveWorkoutId) {
        setRetroactiveWorkoutId(workoutsData[0].id);
      }
    } catch (error) {
      console.error("Failed to load dashboard data", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setIsRetroModalOpen(true);
  };

  const handleSaveRetroactiveSession = async () => {
    if (!retroactiveWorkoutId || !selectedDate) {
      alert("Por favor, selecione um treino e uma data.");
      return;
    }

    const selectedWorkout = workouts.find(w => w.id === retroactiveWorkoutId);
    if (!selectedWorkout) {
      alert("Treino selecionado não encontrado.");
      return;
    }
    
    const performedExercises: PerformedExercise[] = selectedWorkout.exerciseGroups.flatMap(group => 
        group.exercises.map(ex => ({
            exerciseId: ex.id,
            name: ex.name,
            sets: Array.from({ length: ex.sets }, () => ({
                reps: parseInt(ex.reps.split('-')[0]) || 10,
                load: ex.load
            }))
        }))
    );
    
    const newSession: Session = {
        id: generateUUID(),
        workoutId: selectedWorkout.id,
        workoutName: selectedWorkout.name,
        date: selectedDate,
        duration: 3600, // Default duration of 1 hour (in seconds)
        performedExercises: performedExercises,
    };

    await saveSession(newSession);
    setIsRetroModalOpen(false);
    await loadData(); // Reload dashboard data
  };

  const quickStartWorkout = workouts.length > 0 ? workouts[0] : null;
  const totalExercisesInQuickStart = quickStartWorkout?.exerciseGroups?.reduce((sum, group) => sum + group.exercises.length, 0) || 0;

  if (loading && !isRetroModalOpen) {
    return <div className="p-4 text-center">Carregando...</div>;
  }

  return (
    <>
      <div className="p-4 space-y-6">
        <header>
          <div className="flex items-center gap-2 mb-1">
              <Icon name="Dumbbell" size={16} className="text-gray-400 dark:text-gray-500" />
              <span className="font-bold text-lg text-gray-700 dark:text-slate-300">Reis Fit</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">
            Olá, {profile?.name || 'Atleta'}!
          </h1>
          <p className="text-gray-500 dark:text-slate-400">Pronto para o treino de hoje?</p>
        </header>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-800 dark:border dark:border-slate-700 p-4 rounded-lg shadow-md flex flex-col items-center justify-center">
              <Icon name="Timer" size={24} className="text-blue-500 mb-2" />
              <span className="text-2xl font-bold">{sessions.length}</span>
              <span className="text-sm text-gray-500 dark:text-slate-400">Treinos</span>
          </div>
          <div className="bg-white dark:bg-slate-800 dark:border dark:border-slate-700 p-4 rounded-lg shadow-md flex flex-col items-center justify-center">
              <Icon name="Check" size={24} className="text-orange-500 mb-2" />
              <span className="text-2xl font-bold">{streak}</span>
              <span className="text-sm text-gray-500 dark:text-slate-400">Dias em sequência</span>
          </div>
        </div>

        {quickStartWorkout && (
          <div className="bg-white dark:bg-slate-800 dark:border dark:border-slate-700 p-4 rounded-lg shadow-md">
              <h2 className="font-semibold mb-1">Início Rápido: {quickStartWorkout.name}</h2>
              <p className="text-sm text-gray-600 dark:text-slate-300 mb-3">{totalExercisesInQuickStart} exercícios</p>
              <button 
                onClick={() => onStartWorkout(quickStartWorkout)}
                className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors"
              >
                <Icon name="Play" size={18} />
                <span>Iniciar Treino</span>
              </button>
          </div>
        )}
        
        <div className="bg-white dark:bg-slate-800 dark:border dark:border-slate-700 p-4 rounded-lg shadow-md">
            <h2 className="font-semibold mb-4">Calendário de Atividades</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500 -mt-3 mb-3">Clique em um dia para adicionar um treino retroativo.</p>
            <AnnualCalendar sessions={sessions} onDayClick={handleDayClick} />
        </div>

      </div>

      <Modal isOpen={isRetroModalOpen} onClose={() => setIsRetroModalOpen(false)} title="Adicionar Treino Retroativo">
         <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Treino</label>
                <select 
                    value={retroactiveWorkoutId}
                    onChange={(e) => setRetroactiveWorkoutId(e.target.value)}
                    className="mt-1 w-full p-2 border rounded-md bg-white dark:bg-slate-700 dark:text-white border-gray-300 dark:border-slate-600"
                >
                    {workouts.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                </select>
            </div>
            <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Data do Treino</label>
                 <input 
                    type="text"
                    value={selectedDate ? selectedDate.toLocaleDateString('pt-BR') : ''}
                    readOnly
                    className="mt-1 w-full p-2 border rounded-md dark:bg-slate-800 dark:text-gray-400 border-gray-300 dark:border-slate-600"
                 />
            </div>
            <div className="flex gap-4 pt-2">
                <button onClick={() => setIsRetroModalOpen(false)} className="w-full bg-gray-200 dark:bg-slate-600 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-500">
                    Cancelar
                </button>
                <button 
                    onClick={handleSaveRetroactiveSession} 
                    disabled={!retroactiveWorkoutId || !selectedDate}
                    className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed">
                    Salvar
                </button>
            </div>
         </div>
      </Modal>
    </>
  );
};

export default Dashboard;