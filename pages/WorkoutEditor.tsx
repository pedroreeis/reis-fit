import React, { useState, useEffect } from 'react';
import { Workout, Exercise, ExerciseGroup, WorkoutCategory } from '../types';
import { saveWorkout } from '../services/db';
import { generateUUID } from '../utils/helpers';
import Icon from '../components/Icon';

interface WorkoutEditorProps {
  workoutToEdit: Workout | null;
  onSave: () => void;
  onCancel: () => void;
}

const emptyWorkout: Omit<Workout, 'id' | 'createdAt'> = {
  name: '',
  category: '',
  muscleGroups: [],
  exerciseGroups: [],
};

const emptyExercise: Omit<Exercise, 'id'> = {
    name: '',
    sets: 3,
    reps: '10',
    load: 10,
    rest: 60,
};

const muscleGroupList = ['Peito', 'Costas', 'Ombros', 'Bíceps', 'Tríceps', 'Pernas', 'Quadríceps', 'Isquiotibiais', 'Panturrilhas', 'Glúteos', 'Abdômen', 'Lombar', 'Antebraço', 'Trapézio'];
const techniqueList = ['Drop-set', 'Bi-set', 'Tri-set', 'Rest-pause', 'Super-série', 'Pico de Contração', 'Fadiga Excêntrica', 'Combinado'];


const WorkoutEditor: React.FC<WorkoutEditorProps> = ({ workoutToEdit, onSave, onCancel }) => {
  const [workout, setWorkout] = useState<Omit<Workout, 'id' | 'createdAt'>>(emptyWorkout);
  const [isNew, setIsNew] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [muscleInput, setMuscleInput] = useState('');
  const [muscleSuggestions, setMuscleSuggestions] = useState<string[]>([]);


  useEffect(() => {
    if (workoutToEdit) {
      setWorkout({
        ...emptyWorkout,
        ...workoutToEdit,
        muscleGroups: workoutToEdit.muscleGroups || [],
        category: workoutToEdit.category || '',
      });
      setIsNew(false);
      setEditingId(workoutToEdit.id);
    } else {
      setWorkout(emptyWorkout);
      setIsNew(true);
      setEditingId(null);
    }
  }, [workoutToEdit]);

  const handleWorkoutChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setWorkout({ ...workout, [name]: value as any });
  };

  const handleGroupChange = (groupIndex: number, field: keyof ExerciseGroup, value: any) => {
    const updatedGroups = [...workout.exerciseGroups];
    updatedGroups[groupIndex] = { ...updatedGroups[groupIndex], [field]: value };
    setWorkout({ ...workout, exerciseGroups: updatedGroups });
  };
  
  const handleExerciseChange = (groupIndex: number, exIndex: number, field: keyof Exercise, value: string | number) => {
    const updatedGroups = [...workout.exerciseGroups];
    const group = { ...updatedGroups[groupIndex] };
    const updatedExercises = [...group.exercises];
    updatedExercises[exIndex] = { ...updatedExercises[exIndex], [field]: value };
    group.exercises = updatedExercises;
    updatedGroups[groupIndex] = group;
    setWorkout({ ...workout, exerciseGroups: updatedGroups });
  };
  
  const addGroup = () => {
    const newGroup: ExerciseGroup = { id: generateUUID(), technique: '', exercises: [{...emptyExercise, id: generateUUID()}] };
    setWorkout(prev => ({ ...prev, exerciseGroups: [...prev.exerciseGroups, newGroup] }));
  };
  
  const removeGroup = (groupIndex: number) => {
    setWorkout(prev => ({ ...prev, exerciseGroups: prev.exerciseGroups.filter((_, i) => i !== groupIndex) }));
  };

  const addExerciseToGroup = (groupIndex: number) => {
    const newExercise: Exercise = { ...emptyExercise, id: generateUUID() };
    const updatedGroups = [...workout.exerciseGroups];
    updatedGroups[groupIndex].exercises.push(newExercise);
    setWorkout({ ...workout, exerciseGroups: updatedGroups });
  };

  const removeExerciseFromGroup = (groupIndex: number, exIndex: number) => {
    const updatedGroups = [...workout.exerciseGroups];
    updatedGroups[groupIndex].exercises = updatedGroups[groupIndex].exercises.filter((_, i) => i !== exIndex);
    setWorkout({ ...workout, exerciseGroups: updatedGroups });
  };

  const handleSaveWorkout = async () => {
    if (!workout.name.trim()) {
      alert('Por favor, dê um nome ao treino.');
      return;
    }
    const workoutToSave: Workout = {
      ...workout,
      id: editingId || generateUUID(),
      createdAt: new Date(),
    };
    await saveWorkout(workoutToSave);
    onSave();
  };
  
  // --- Muscle Group Autocomplete Logic ---
  const handleMuscleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMuscleInput(value);
    if (value.trim()) {
      const suggestions = muscleGroupList.filter(
        (m) => m.toLowerCase().startsWith(value.toLowerCase()) && !workout.muscleGroups.includes(m)
      );
      setMuscleSuggestions(suggestions);
    } else {
      setMuscleSuggestions([]);
    }
  };

  const addMuscleGroup = (muscle: string) => {
    if (muscle.trim() && !workout.muscleGroups.includes(muscle)) {
      setWorkout(prev => ({ ...prev, muscleGroups: [...prev.muscleGroups, muscle]}));
    }
    setMuscleInput('');
    setMuscleSuggestions([]);
  };

  const handleMuscleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && muscleInput.trim()) {
      e.preventDefault();
      addMuscleGroup(muscleInput.trim());
    }
  };

  const removeMuscleGroup = (muscleToRemove: string) => {
    setWorkout(prev => ({
        ...prev,
        muscleGroups: prev.muscleGroups.filter(m => m !== muscleToRemove)
    }));
  };
  // --- End of Logic ---

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{isNew ? 'Novo Treino' : 'Editar Treino'}</h1>
        <button onClick={onCancel} className="p-2">
            <Icon name="X" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Workout Details */}
        <div className="bg-white dark:bg-slate-800 dark:border dark:border-slate-700 p-4 rounded-lg space-y-4">
          <div>
            <label className="block text-sm font-medium">Nome do Treino</label>
            <input type="text" name="name" value={workout.name} onChange={handleWorkoutChange} className="mt-1 w-full p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" placeholder="Ex: Treino A - Peito e Tríceps" />
          </div>
          <div>
            <label className="block text-sm font-medium">Categoria</label>
            <select name="category" value={workout.category || ''} onChange={handleWorkoutChange} className="mt-1 w-full p-2 border rounded-md bg-white dark:bg-slate-700 dark:border-slate-600">
              <option value="">Nenhuma</option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="Full Body">Full Body</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Grupos Musculares</label>
            <div className="relative">
                <div className="mt-1 flex flex-wrap items-center gap-2 p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600 min-h-[42px]">
                    {workout.muscleGroups.map(group => (
                        <span key={group} className="flex items-center bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 text-sm font-medium px-2 py-1 rounded-full">
                            {group}
                            <button onClick={() => removeMuscleGroup(group)} className="ml-2 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100">
                                <Icon name="X" size={14} />
                            </button>
                        </span>
                    ))}
                    <input 
                        type="text"
                        value={muscleInput}
                        onChange={handleMuscleInputChange}
                        onKeyDown={handleMuscleInputKeyDown}
                        className="flex-grow bg-transparent outline-none p-1"
                        placeholder={workout.muscleGroups.length === 0 ? "Ex: Peito, Costas..." : "Adicionar..."}
                    />
                </div>
                {muscleSuggestions.length > 0 && (
                    <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-600 border dark:border-slate-500 rounded-md shadow-lg max-h-40 overflow-y-auto">
                        {muscleSuggestions.map(suggestion => (
                            <li 
                                key={suggestion} 
                                onClick={() => addMuscleGroup(suggestion)}
                                className="p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-500"
                            >
                                {suggestion}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
          </div>
        </div>
        
        {/* Exercise Groups */}
        <h2 className="text-lg font-semibold border-t dark:border-slate-700 pt-4">Grupos de Exercícios</h2>
        {workout.exerciseGroups.map((group, groupIndex) => (
          <div key={group.id} className="p-4 bg-white dark:bg-slate-800 dark:border dark:border-slate-700 rounded-lg space-y-4">
            <div className="flex justify-between items-center border-b dark:border-slate-700 pb-3">
              <select
                value={group.technique || ''}
                onChange={(e) => handleGroupChange(groupIndex, 'technique', e.target.value)}
                className="font-semibold text-lg bg-transparent w-full dark:bg-slate-800 border-none outline-none focus:ring-0"
              >
                <option value="">Nenhuma Técnica</option>
                {techniqueList.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <button onClick={() => removeGroup(groupIndex)} className="text-red-500 ml-2">
                <Icon name="Trash2" size={20} />
              </button>
            </div>
            {group.exercises.map((ex, exIndex) => (
              <div key={ex.id} className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <input type="text" placeholder="Nome do Exercício" value={ex.name} onChange={(e) => handleExerciseChange(groupIndex, exIndex, 'name', e.target.value)} className="font-semibold text-md bg-transparent w-full" />
                  <button onClick={() => removeExerciseFromGroup(groupIndex, exIndex)} className="text-red-500/70 hover:text-red-500 ml-2">
                    <Icon name="X" size={18} />
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <label className="text-xs">Séries</label>
                    <input type="number" value={ex.sets} onChange={(e) => handleExerciseChange(groupIndex, exIndex, 'sets', parseInt(e.target.value) || 0)} className="w-full p-1 border rounded dark:bg-slate-700 dark:border-slate-600" />
                  </div>
                  <div>
                    <label className="text-xs">Reps</label>
                    <input type="text" value={ex.reps} onChange={(e) => handleExerciseChange(groupIndex, exIndex, 'reps', e.target.value)} className="w-full p-1 border rounded dark:bg-slate-700 dark:border-slate-600" />
                  </div>
                  <div>
                    <label className="text-xs">Carga (kg)</label>
                    <input type="number" value={ex.load} onChange={(e) => handleExerciseChange(groupIndex, exIndex, 'load', parseFloat(e.target.value) || 0)} className="w-full p-1 border rounded dark:bg-slate-700 dark:border-slate-600" />
                  </div>
                  <div>
                    <label className="text-xs">Descanso (s)</label>
                    <input type="number" value={ex.rest} onChange={(e) => handleExerciseChange(groupIndex, exIndex, 'rest', parseInt(e.target.value) || 0)} className="w-full p-1 border rounded dark:bg-slate-700 dark:border-slate-600" />
                  </div>
                </div>
              </div>
            ))}
             <button onClick={() => addExerciseToGroup(groupIndex)} className="w-full text-sm border-2 border-dashed border-gray-300 dark:border-slate-600 text-gray-500 dark:text-slate-400 font-bold py-1 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                Adicionar Exercício (Combinado)
            </button>
          </div>
        ))}

        <button onClick={addGroup} className="w-full border-2 border-dashed border-blue-400/50 dark:border-blue-700/50 text-blue-600 dark:text-blue-400 font-bold py-2 px-4 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
          Adicionar Grupo de Exercícios
        </button>
      </div>

      <div className="flex gap-4 pt-4">
        <button onClick={onCancel} className="w-full bg-gray-200 dark:bg-slate-700 font-bold py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600">
          Cancelar
        </button>
        <button onClick={handleSaveWorkout} className="w-full bg-blue-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-600">
          Salvar Treino
        </button>
      </div>
    </div>
  );
};

export default WorkoutEditor;