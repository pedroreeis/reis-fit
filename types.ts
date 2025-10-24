export type Page = 'dashboard' | 'workouts' | 'history' | 'settings';

export type WorkoutCategory = 'A' | 'B' | 'C' | 'D' | 'Full Body' | '';

export interface UserProfile {
  id: number;
  name: string;
  gender: 'male' | 'female';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  weight?: number;
  height?: number;
  age?: number;
}

export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string; // e.g., "8-12"
  load: number; // starting load in kg
  rest: number; // in seconds
}

export interface ExerciseGroup {
  id: string;
  technique: string;
  exercises: Exercise[];
}

export interface Workout {
  id: string;
  name: string;
  category: WorkoutCategory;
  muscleGroups: string[];
  exerciseGroups: ExerciseGroup[];
  createdAt: Date;
}

export interface PerformedSet {
  reps: number;
  load: number;
}

export interface PerformedExercise {
  exerciseId: string;
  name: string;
  sets: PerformedSet[];
}

export interface Session {
  id: string;
  workoutId: string;
  workoutName: string;
  date: Date;
  duration: number; // in seconds
  performedExercises: PerformedExercise[];
}
