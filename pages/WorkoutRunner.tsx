import React, { useState, useEffect, useRef } from 'react';
import { Workout, Session, PerformedExercise, PerformedSet, Exercise, ExerciseGroup } from '../types';
import { saveSession } from '../services/db';
import { generateUUID, formatDuration } from '../utils/helpers';
import Icon from '../components/Icon';

interface WorkoutRunnerProps {
  workout: Workout;
  onFinish: (session: Session) => void;
}

const WorkoutRunner: React.FC<WorkoutRunnerProps> = ({ workout, onFinish }) => {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  
  const [setsDone, setSetsDone] = useState<{[key: string]: boolean[]}>({}); // {exerciseId: [true, false, ...]}
  const [isResting, setIsResting] = useState(false);
  const [restTime, setRestTime] = useState(0);
  const [restTimerKey, setRestTimerKey] = useState(0); // To reset timer component
  const [workoutDuration, setWorkoutDuration] = useState(0);

  const [performedData, setPerformedData] = useState<PerformedExercise[]>([]);
  
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const durationInterval = setInterval(() => {
      setWorkoutDuration(prev => prev + 1);
    }, 1000);
    return () => clearInterval(durationInterval);
  }, []);

  useEffect(() => {
    if (isResting && restTime > 0) {
      timerRef.current = window.setTimeout(() => {
        setRestTime(prev => prev - 1);
      }, 1000);
    } else if (isResting && restTime === 0) {
      setIsResting(false);
      if (navigator.vibrate) navigator.vibrate(200);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isResting, restTime]);
  
  const allExercisesFlat = workout.exerciseGroups.flatMap(g => g.exercises);
  const totalExercises = allExercisesFlat.length;
  let exercisesCompletedCount = 0;
  for(const key in setsDone) {
    if(setsDone[key].every(s => s === true)) exercisesCompletedCount++;
  }


  const handleSetCheck = (groupIndex: number, exIndex: number, setIndex: number) => {
    const group = workout.exerciseGroups[groupIndex];
    const exercise = group.exercises[exIndex];

    setSetsDone(prev => {
      const newSets = { ...prev };
      if (!newSets[exercise.id]) {
        newSets[exercise.id] = new Array(exercise.sets).fill(false);
      }
      newSets[exercise.id][setIndex] = !newSets[exercise.id][setIndex];
      return newSets;
    });

    // Log performed set
    // For simplicity, we log with default reps/load. A more complex version would have inputs.
    const reps = parseInt(exercise.reps.split('-')[0]) || 0;
    const load = exercise.load;
    
    setPerformedData(prev => {
        const exerciseData = prev.find(p => p.exerciseId === exercise.id);
        if(exerciseData) {
            // Here we just add a set, can be improved to remove on uncheck
            exerciseData.sets.push({reps, load});
            return [...prev];
        }
        return [...prev, {
            exerciseId: exercise.id,
            name: exercise.name,
            sets: [{reps, load}]
        }];
    })

    // Start rest timer
    setIsResting(false); // Cancel any ongoing rest
    setTimeout(() => {
        setRestTime(exercise.rest);
        setIsResting(true);
        setRestTimerKey(prev => prev + 1); // Force re-render of timer
    }, 100);
  };
  
  const handleSkipRest = () => {
      setRestTime(0);
      setIsResting(false);
  }

  const handleFinishWorkout = async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    const finalSession: Session = {
      id: generateUUID(),
      workoutId: workout.id,
      workoutName: workout.name,
      date: new Date(),
      duration: workoutDuration,
      performedExercises: performedData,
    };
    await saveSession(finalSession);
    onFinish(finalSession);
  };
  
  return (
    <div className="pb-24">
      {/* Header */}
      <div className="p-4 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-10 border-b dark:border-slate-800">
        <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold truncate">{workout.name}</h1>
            <div className="text-lg font-semibold">{formatDuration(workoutDuration)}</div>
        </div>
        <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5 mt-2">
            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${(exercisesCompletedCount / totalExercises) * 100}%` }}></div>
        </div>
        <p className="text-xs text-right mt-1 text-gray-500 dark:text-slate-400">{exercisesCompletedCount} de {totalExercises} exercícios completos</p>
      </div>

      {/* Exercises List */}
      <div className="p-4 space-y-4">
        {workout.exerciseGroups.map((group, groupIndex) => (
          <div key={group.id} className="bg-white dark:bg-slate-800 dark:border dark:border-slate-700 rounded-lg shadow-md overflow-hidden">
            {group.technique && (
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/40">
                <p className="text-center font-semibold text-sm text-yellow-800 dark:text-yellow-300">{group.technique}</p>
              </div>
            )}
            {group.exercises.map((exercise, exIndex) => (
              <div key={exercise.id} className="p-4 border-b dark:border-slate-700 last:border-b-0">
                <h3 className="font-bold text-lg">{exercise.name}</h3>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-3">{exercise.sets}x {exercise.reps} reps, {exercise.load}kg, {exercise.rest}s descanso</p>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: exercise.sets }).map((_, setIndex) => {
                    const isDone = setsDone[exercise.id]?.[setIndex] || false;
                    return (
                      <button 
                        key={setIndex}
                        onClick={() => handleSetCheck(groupIndex, exIndex, setIndex)}
                        className={`w-12 h-12 flex items-center justify-center rounded-md font-bold text-lg transition-colors ${
                            isDone 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-200'
                        }`}
                      >
                        {setIndex + 1}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Footer / Finish Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t dark:border-slate-800">
        {isResting && (
            <div key={restTimerKey} className="flex items-center justify-between mb-2">
                <p className="font-semibold">Descanso:</p>
                <div className="flex items-center gap-4">
                    <p className="text-2xl font-mono font-bold">{formatDuration(restTime)}</p>
                    <button onClick={handleSkipRest} className="bg-blue-500 text-white font-bold text-sm px-4 py-2 rounded-lg">PULAR</button>
                </div>
            </div>
        )}
        <button 
            onClick={handleFinishWorkout}
            className="w-full bg-red-500 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-red-600 transition-colors"
        >
            Finalizar Treino
        </button>
      </div>
    </div>
  );
};

export default WorkoutRunner;
