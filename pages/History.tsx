import React, { useState, useEffect, useMemo } from 'react';
import { getSessions, getWorkouts } from '../services/db';
import { Session, Workout } from '../types';
import Icon from '../components/Icon';
import { formatDate, formatDuration } from '../utils/helpers';
import MuscleMap from '../components/MuscleMap';

const History: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  async function loadHistory() {
    try {
      setLoading(true);
      const [sessionsData, workoutsData] = await Promise.all([
        getSessions(),
        getWorkouts()
      ]);
      setSessions(sessionsData);
      setWorkouts(workoutsData);
    } catch (error) {
      console.error("Failed to load history", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);
  
  const muscleCounts = useMemo(() => {
    if (!sessions.length || !workouts.length) return {};
    
    const workoutMap = new Map(workouts.map(w => [w.id, w]));
    const counts: { [key: string]: number } = {};

    sessions.forEach(session => {
        const workout = workoutMap.get(session.workoutId);
        if (workout?.muscleGroups) {
            workout.muscleGroups.forEach(muscle => {
                counts[muscle] = (counts[muscle] || 0) + 1;
            });
        }
    });

    return counts;
  }, [sessions, workouts]);

  const toggleSessionDetails = (sessionId: string) => {
    setExpandedSessionId(prevId => prevId === sessionId ? null : sessionId);
  };


  if (loading) {
    return <div className="p-4 text-center">Carregando histórico...</div>;
  }

  return (
    <>
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Icon name="History" size={20} className="text-gray-400 dark:text-gray-500" />
            <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Histórico de Treinos</h1>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 dark:border dark:border-slate-700 rounded-lg shadow-md">
          <MuscleMap muscleCounts={muscleCounts} />
        </div>

        {sessions.length > 0 ? (
          sessions.map((session) => (
            <div key={session.id} className="bg-white dark:bg-slate-800 dark:border dark:border-slate-700 p-4 rounded-lg shadow-md">
              <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleSessionDetails(session.id)}>
                <div>
                  <h2 className="font-bold text-lg">{session.workoutName}</h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    {formatDate(new Date(session.date))} &bull; {formatDuration(session.duration)}
                  </p>
                </div>
                <Icon name="ChevronRight" className={`transform transition-transform ${expandedSessionId === session.id ? 'rotate-90' : ''}`} />
              </div>
              
              {expandedSessionId === session.id && (
                <div className="mt-4 pt-4 border-t dark:border-slate-700 space-y-2">
                  <h3 className="text-md font-semibold mb-2">Exercícios Realizados:</h3>
                  {session.performedExercises.length > 0 ? session.performedExercises.map(ex => (
                    <div key={ex.exerciseId} className="text-sm">
                      <p className="font-semibold text-gray-700 dark:text-slate-200">{ex.name}</p>
                      <ul className="list-disc list-inside text-gray-500 dark:text-slate-400 pl-2">
                          {ex.sets.map((set, index) => (
                              <li key={index}>{set.reps} reps @ {set.load}kg</li>
                          ))}
                      </ul>
                    </div>
                  )) : <p className="text-sm text-gray-500 dark:text-slate-400">Nenhum exercício registrado para esta sessão.</p>}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 dark:text-slate-400">Nenhum treino registrado ainda.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default History;