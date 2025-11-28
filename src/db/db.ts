import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

let dbInstance: SQLiteDatabase | null = null;

const getDatabase = async () => {
    if (!dbInstance) {
        dbInstance = await openDatabaseAsync('rollcall.db');
    }
    return dbInstance;
};

export const initDB = async () => {
    const db = await getDatabase();

    await db.withExclusiveTransactionAsync(async (txn) => {
        await txn.execAsync(`CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          min_attendance INTEGER NOT NULL,
          theme_pref TEXT DEFAULT 'system'
        );`);

        await txn.execAsync(`CREATE TABLE IF NOT EXISTS subjects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          teacher TEXT,
          color TEXT NOT NULL,
          total_classes INTEGER DEFAULT 0,
          attended_classes INTEGER DEFAULT 0
        );`);

        await txn.execAsync(`CREATE TABLE IF NOT EXISTS timetable (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          subject_id INTEGER NOT NULL,
          day_index INTEGER NOT NULL, -- 0 = Sun, 1 = Mon, etc.
          start_time TEXT NOT NULL,
          end_time TEXT NOT NULL,
          location TEXT,
          FOREIGN KEY (subject_id) REFERENCES subjects (id)
        );`);

        await txn.execAsync(`CREATE TABLE IF NOT EXISTS attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          subject_id INTEGER NOT NULL,
          date TEXT NOT NULL, -- ISO Date String (YYYY-MM-DD)
          status TEXT NOT NULL, -- 'present', 'absent', 'cancelled', 'holiday'
          FOREIGN KEY (subject_id) REFERENCES subjects (id)
        );`);

        await txn.execAsync(`CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          subject_id INTEGER,
          due_date TEXT NOT NULL,
          is_completed INTEGER DEFAULT 0, -- 0 = false, 1 = true
          FOREIGN KEY (subject_id) REFERENCES subjects (id)
        );`);
    });
};

// Helper: Check if user exists (for Onboarding check)
export const checkUserExists = async (): Promise<boolean> => {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ id: number }>('SELECT id FROM users LIMIT 1', []);
    return Boolean(result);
};

// Helper: Create User (Onboarding)
export const createUser = async (name: string, minAttendance: number): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync('INSERT INTO users (name, min_attendance) VALUES (?, ?)', [name, minAttendance]);
};

// Helper: Get User Profile
export const getUser = async (): Promise<any | null> => {
    const db = await getDatabase();
    return db.getFirstAsync('SELECT * FROM users LIMIT 1', []);
};

// Helper: Update Theme Preference
export const updateThemePreference = async (theme: 'light' | 'dark' | 'system'): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync('UPDATE users SET theme_pref = ? WHERE id = 1', [theme]);
};


// ... (Your existing initDB, checkUserExists, createUser, getUser code)

// --- SUBJECTS OPERATIONS ---

export interface Subject {
    id: number;
    name: string;
    teacher?: string;
    color: string;
    total_classes: number;
    attended_classes: number;
}

// 1. Add a new subject
export const addSubject = async (
    name: string,
    teacher: string,
    color: string,
    totalClasses: number = 0,
    attendedClasses: number = 0
): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync(
        'INSERT INTO subjects (name, teacher, color, total_classes, attended_classes) VALUES (?, ?, ?, ?, ?)',
        [name, teacher, color, totalClasses, attendedClasses]
    );
};

// 2. Get all subjects
export const getSubjects = async (): Promise<Subject[]> => {
    const db = await getDatabase();
    return await db.getAllAsync<Subject>('SELECT * FROM subjects');
};

// 3. Delete a subject (Optional for now, but good to have)
export const deleteSubject = async (id: number): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM subjects WHERE id = ?', [id]);
};