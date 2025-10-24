import React, { useState } from 'react';
import { Page, Workout, Session } from './types';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';
import History from './pages/History';
import Settings from './pages/Settings';
import WorkoutEditor from './pages/WorkoutEditor';
import WorkoutRunner from './pages/WorkoutRunner';
import PwaInstallPrompt from './components/PwaInstallPrompt';
import WorkoutSummary from './pages/WorkoutSummary';

type AppState = {
  page: Page;
  editingWorkout: Workout | null;
  runningWorkout: Workout | null;
  finishedSession: Session | null;
  isEditing: boolean;
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    page: 'dashboard',
    editingWorkout: null,
    runningWorkout: null,
    finishedSession: null,
    isEditing: false,
  });
  

  const navigate = (page: Page) => setState(s => ({ ...s, page, isEditing: false, editingWorkout: null, runningWorkout: null, finishedSession: null }));

  const handleNewWorkout = () => setState(s => ({ ...s, isEditing: true, editingWorkout: null }));
  const handleEditWorkout = (workout: Workout) => setState(s => ({ ...s, isEditing: true, editingWorkout: workout }));
  const handleSaveWorkout = () => setState(s => ({ ...s, isEditing: false, editingWorkout: null, page: 'workouts' }));
  const handleCancelEdit = () => setState(s => ({ ...s, isEditing: false, editingWorkout: null }));
  
  const handleStartWorkout = (workout: Workout) => setState(s => ({...s, runningWorkout: workout}));
  const handleFinishWorkout = (session: Session) => setState(s => ({...s, runningWorkout: null, finishedSession: session}));
  const handleCloseSummary = () => setState(s => ({...s, finishedSession: null, page: 'dashboard'}));

  const renderPage = () => {
    if (state.finishedSession) {
      return <WorkoutSummary session={state.finishedSession} onClose={handleCloseSummary} />;
    }
    if (state.runningWorkout) {
      return <WorkoutRunner workout={state.runningWorkout} onFinish={handleFinishWorkout} />;
    }
    if (state.isEditing) {
      return <WorkoutEditor workoutToEdit={state.editingWorkout} onSave={handleSaveWorkout} onCancel={handleCancelEdit} />;
    }

    switch (state.page) {
      case 'dashboard':
        return <Dashboard onStartWorkout={handleStartWorkout} />;
      case 'workouts':
        return <Workouts onEditWorkout={handleEditWorkout} onNewWorkout={handleNewWorkout} onStartWorkout={handleStartWorkout} />;
      case 'history':
        return <History />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onStartWorkout={handleStartWorkout} />;
    }
  };

  return (
    <div className="font-sans antialiased text-gray-800 bg-gray-50 min-h-screen dark:bg-slate-900 dark:text-slate-200">
      <main className="pb-20">
        {renderPage()}
      </main>
      {!state.isEditing && !state.runningWorkout && !state.finishedSession &&(
        <BottomNav activePage={state.page} onNavigate={navigate} />
      )}
      <PwaInstallPrompt />
    </div>
  );
};

export default App;