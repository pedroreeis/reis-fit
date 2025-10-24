
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { UserProfile, Workout, Session } from '../types';

const DB_NAME = 'ReisFitDB';
const DB_VERSION = 1;

interface ReisFitDB extends DBSchema {
  user: {
    key: number;
    value: UserProfile;
  };
  workouts: {
    key: string;
    value: Workout;
    indexes: { 'createdAt': Date };
  };
  sessions: {
    key: string;
    value: Session;
    indexes: { 'date': Date };
  };
}

let db: IDBPDatabase<ReisFitDB>;

export async function initDB() {
  if (db) return db;
  db = await openDB<ReisFitDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('user')) {
        db.createObjectStore('user', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('workouts')) {
        const store = db.createObjectStore('workouts', { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt');
      }
      if (!db.objectStoreNames.contains('sessions')) {
        const store = db.createObjectStore('sessions', { keyPath: 'id' });
        store.createIndex('date', 'date');
      }
    },
  });
  return db;
}

// User Profile
export async function getUserProfile(): Promise<UserProfile | undefined> {
  const db = await initDB();
  return db.get('user', 1);
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const db = await initDB();
  await db.put('user', { ...profile, id: 1 });
}

// Workouts
export async function getWorkouts(): Promise<Workout[]> {
  const db = await initDB();
  return db.getAll('workouts');
}

export async function getWorkout(id: string): Promise<Workout | undefined> {
  const db = await initDB();
  return db.get('workouts', id);
}

export async function saveWorkout(workout: Workout): Promise<void> {
  const db = await initDB();
  await db.put('workouts', workout);
}

export async function deleteWorkout(id: string): Promise<void> {
  const db = await initDB();
  await db.delete('workouts', id);
}

// Sessions
export async function getSessions(): Promise<Session[]> {
  const db = await initDB();
  const sessions = await db.getAllFromIndex('sessions', 'date');
  return sessions.reverse();
}

export async function saveSession(session: Session): Promise<void> {
  const db = await initDB();
  await db.put('sessions', session);
}

// Stats
export async function getSessionsInRange(startDate: Date, endDate: Date): Promise<Session[]> {
    const db = await initDB();
    const range = IDBKeyRange.bound(startDate, endDate);
    return await db.getAllFromIndex('sessions', 'date', range);
}

export async function calculateStreak(): Promise<number> {
    const db = await initDB();
    const sessions = await db.getAllFromIndex('sessions', 'date');
    if (sessions.length === 0) return 0;

    const uniqueDays = new Set<string>();
    sessions.forEach(s => uniqueDays.add(s.date.toISOString().split('T')[0]));
    
    const sortedDays = Array.from(uniqueDays).sort().reverse();

    let streak = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayStr = today.toISOString().split('T')[0];

    // Check if the most recent workout was today or yesterday
    if (sortedDays[0] === todayStr || new Date(today.setDate(today.getDate() - 1)).toISOString().split('T')[0] === sortedDays[0]) {
       streak = 1;
       let lastDay = new Date(sortedDays[0]);

        for (let i = 1; i < sortedDays.length; i++) {
            const currentDay = new Date(sortedDays[i]);
            const expectedPreviousDay = new Date(lastDay);
            expectedPreviousDay.setDate(lastDay.getDate() - 1);

            if (currentDay.getTime() === expectedPreviousDay.getTime()) {
                streak++;
                lastDay = currentDay;
            } else {
                break;
            }
        }
    }

    return streak;
}

export async function exportData() {
    const db = await initDB();
    const user = await db.getAll('user');
    const workouts = await db.getAll('workouts');
    const sessions = await db.getAll('sessions');
    return { user, workouts, sessions };
}

export async function importData(data: { user: UserProfile[], workouts: Workout[], sessions: Session[] }) {
    const db = await initDB();
    const tx = db.transaction(['user', 'workouts', 'sessions'], 'readwrite');
    await tx.objectStore('user').clear();
    await tx.objectStore('workouts').clear();
    await tx.objectStore('sessions').clear();

    for (const item of data.user) await tx.objectStore('user').put(item);
    for (const item of data.workouts) await tx.objectStore('workouts').put(item);
    // Dates from JSON are strings, need to convert back
    for (const item of data.sessions) {
        item.date = new Date(item.date);
        await tx.objectStore('sessions').put(item);
    }

    await tx.done;
}
