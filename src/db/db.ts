import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

let dbInstance: SQLiteDatabase | null = null;

const getDatabase = async () => {
    if (!dbInstance) {
        dbInstance = await openDatabaseAsync('rollcall_v3.db');
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
          theme_pref TEXT DEFAULT 'system',
          created_at TEXT -- ISO String of when they onboarded
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
          timetable_id INTEGER, -- NULL for extra classes, set for regular timetable classes
          extra_class_id INTEGER, -- NULL for regular classes, set for extra classes
          FOREIGN KEY (subject_id) REFERENCES subjects (id),
          FOREIGN KEY (timetable_id) REFERENCES timetable (id),
          FOREIGN KEY (extra_class_id) REFERENCES extra_classes (id)
        );`);

        // Create Notifications Table
        await txn.execAsync(`CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        type TEXT NOT NULL, -- 'task', 'class', 'system'
        trigger_at TEXT NOT NULL, -- ISO Date when it should show up
        is_read INTEGER DEFAULT 0
        );`);

        // Migration: Add columns if they don't exist (for existing databases)
        try {
            await txn.execAsync(`ALTER TABLE attendance ADD COLUMN timetable_id INTEGER;`);
        } catch (e) {
            // Column already exists, ignore
        }
        try {
            await txn.execAsync(`ALTER TABLE attendance ADD COLUMN extra_class_id INTEGER;`);
        } catch (e) {
            // Column already exists, ignore
        }
        try {
            await txn.execAsync(`ALTER TABLE users ADD COLUMN created_at TEXT;`);
            const now = new Date().toISOString();
            await txn.runAsync(`UPDATE users SET created_at = ? WHERE created_at IS NULL`, [now]);
        } catch (e) {
            // Column likely exists
        }

        //Add Settings Columns to Users (Migration)
        try {
            await txn.execAsync(`ALTER TABLE users ADD COLUMN notify_classes INTEGER DEFAULT 1;`);
            await txn.execAsync(`ALTER TABLE users ADD COLUMN notify_tasks INTEGER DEFAULT 1;`);
        } catch (e) { /* Ignore if exists */ }

        await txn.execAsync(`CREATE TABLE IF NOT EXISTS tasks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          subject_id INTEGER,
          due_date TEXT NOT NULL,
          is_completed INTEGER DEFAULT 0, -- 0 = false, 1 = true
          FOREIGN KEY (subject_id) REFERENCES subjects (id)
        );`);

        await txn.execAsync(`CREATE TABLE IF NOT EXISTS extra_classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            subject_id INTEGER NOT NULL,
            date TEXT NOT NULL, -- YYYY-MM-DD
            start_time TEXT NOT NULL,
            end_time TEXT NOT NULL,
            location TEXT,
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
    const createdAt = new Date().toISOString();
    await db.runAsync('INSERT INTO users (name, min_attendance, created_at) VALUES (?, ?, ?)', [name, minAttendance, createdAt]);
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

// ... existing code ...

// --- TIMETABLE OPERATIONS ---

export interface TimetableItem {
    id: number;
    subject_id: number;
    day_index: number;
    start_time: string; // "10:00"
    end_time: string;   // "11:00"
    location: string;
    // Joins
    subject_name?: string;
    subject_color?: string;
    teacher?: string;
    // 1 = extra class, undefined/0 = regular
    is_extra?: number;
}

// 1. Add to Schedule
export const addScheduleItem = async (
    subjectId: number,
    dayIndex: number,
    startTime: string,
    endTime: string,
    location: string
): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync(
        'INSERT INTO timetable (subject_id, day_index, start_time, end_time, location) VALUES (?, ?, ?, ?, ?)',
        [subjectId, dayIndex, startTime, endTime, location]
    );
};

// 2. Get Schedule for a specific Day (Joined with Subject details)
export const getScheduleForDay = async (dayIndex: number): Promise<TimetableItem[]> => {
    const db = await getDatabase();
    return await db.getAllAsync<TimetableItem>(
        `SELECT t.*, s.name as subject_name, s.color as subject_color, s.teacher 
       FROM timetable t 
       JOIN subjects s ON t.subject_id = s.id 
       WHERE t.day_index = ? 
       ORDER BY t.start_time ASC`,
        [dayIndex]
    );
};

// 3. Delete Schedule Item
export const deleteScheduleItem = async (id: number): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM timetable WHERE id = ?', [id]);
};

// ... existing code ...

// --- ATTENDANCE OPERATIONS ---

export interface AttendanceRecord {
    id: number;
    subject_id: number;
    date: string;
    status: 'present' | 'absent' | 'cancelled' | 'holiday';
    timetable_id?: number | null; // NULL for extra classes
    extra_class_id?: number | null; // NULL for regular classes
}

// 1. Mark Attendance (Insert or Update) - Now tracks per class instance
export const markAttendance = async (
    subjectId: number,
    date: string,
    status: 'present' | 'absent' | 'cancelled' | 'holiday',
    timetableId?: number | null,
    extraClassId?: number | null
): Promise<void> => {
    const db = await getDatabase();

    // A. Check if record exists for this class instance
    let existing: { id: number } | null = null;

    if (timetableId) {
        existing = await db.getFirstAsync<{ id: number }>(
            'SELECT id FROM attendance WHERE timetable_id = ? AND date = ?',
            [timetableId, date]
        );
    } else if (extraClassId) {
        existing = await db.getFirstAsync<{ id: number }>(
            'SELECT id FROM attendance WHERE extra_class_id = ? AND date = ?',
            [extraClassId, date]
        );
    } else {
        // Fallback: if no class instance ID provided, use old behavior (subject + date)
        existing = await db.getFirstAsync<{ id: number }>(
            'SELECT id FROM attendance WHERE subject_id = ? AND date = ? AND timetable_id IS NULL AND extra_class_id IS NULL',
            [subjectId, date]
        );
    }

    if (existing) {
        // Update existing
        await db.runAsync(
            'UPDATE attendance SET status = ? WHERE id = ?',
            [status, existing.id]
        );
    } else {
        // Insert new
        await db.runAsync(
            'INSERT INTO attendance (subject_id, date, status, timetable_id, extra_class_id) VALUES (?, ?, ?, ?, ?)',
            [subjectId, date, status, timetableId || null, extraClassId || null]
        );
    }

    // B. Recalculate Subject Stats (Total/Attended)
    // 1. Count Total (Present + Absent) - Exclude Cancelled/Holiday
    const totalResult = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM attendance 
       WHERE subject_id = ? AND status IN ('present', 'absent')`,
        [subjectId]
    );

    // 2. Count Attended (Present only)
    const attendedResult = await db.getFirstAsync<{ count: number }>(
        `SELECT COUNT(*) as count FROM attendance 
       WHERE subject_id = ? AND status = 'present'`,
        [subjectId]
    );

    const newTotal = totalResult?.count || 0;
    const newAttended = attendedResult?.count || 0;

    // C. Update Subjects Table
    // Note: We add the "Manual" counts entered during creation (if any)
    // For simplicity now, we overwrite based on calculated logs, 
    // but if you want to keep manual mid-sem entries, logic needs to be additive. 
    // Let's assume we update the columns directly.
    await db.runAsync(
        'UPDATE subjects SET total_classes = ?, attended_classes = ? WHERE id = ?',
        [newTotal, newAttended, subjectId]
    );
};

// 2. Get Attendance for a specific Date (to show active buttons)
export const getAttendanceByDate = async (date: string): Promise<AttendanceRecord[]> => {
    const db = await getDatabase();
    return await db.getAllAsync<AttendanceRecord>(
        'SELECT * FROM attendance WHERE date = ?',
        [date]
    );
};

// 3. Get Single Subject Details (for Spinner update)
export const getSubjectById = async (id: number): Promise<Subject | null> => {
    const db = await getDatabase();
    return await db.getFirstAsync<Subject>('SELECT * FROM subjects WHERE id = ?', [id]);
};


// ... existing code ...

// 4. Update Subject Details
export const updateSubject = async (
    id: number,
    name: string,
    teacher: string,
    color: string
): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync(
        'UPDATE subjects SET name = ?, teacher = ?, color = ? WHERE id = ?',
        [name, teacher, color, id]
    );
};

// --- EXTRA CLASSES OPERATIONS ---

export const addExtraClass = async (
    subjectId: number,
    date: string,
    startTime: string,
    endTime: string,
    location: string
): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync(
        'INSERT INTO extra_classes (subject_id, date, start_time, end_time, location) VALUES (?, ?, ?, ?, ?)',
        [subjectId, date, startTime, endTime, location]
    );
};

export const getExtraClassesForDate = async (date: string): Promise<TimetableItem[]> => {
    const db = await getDatabase();
    // We manually map 'date' to 'day_index' just to match the TimetableItem interface type
    return await db.getAllAsync<TimetableItem>(
        `SELECT e.id, e.subject_id, e.start_time, e.end_time, e.location, 
              s.name as subject_name, s.color as subject_color, s.teacher,
              1 as is_extra -- Flag to identify extra classes
       FROM extra_classes e 
       JOIN subjects s ON e.subject_id = s.id 
       WHERE e.date = ? 
       ORDER BY e.start_time ASC`,
        [date]
    );
};

// ... existing code ...

// --- TASKS OPERATIONS ---

export interface Task {
    id: number;
    title: string;
    description: string;
    subject_id?: number | null;
    due_date: string; // ISO String
    is_completed: number; // 0 or 1
    // Joins
    subject_name?: string;
    subject_color?: string;
}

// 1. Add Task (Returns the new ID)
export const addTask = async (
    title: string,
    description: string,
    subjectId: number | null,
    dueDate: string
): Promise<number> => {
    const db = await getDatabase();
    const result = await db.runAsync(
        'INSERT INTO tasks (title, description, subject_id, due_date, is_completed) VALUES (?, ?, ?, ?, 0)',
        [title, description, subjectId, dueDate]
    );
    return result.lastInsertRowId;
};

// 2. Get All Tasks (Sorted by Due Date, with Subject info)
export const getTasks = async (): Promise<Task[]> => {
    const db = await getDatabase();
    return await db.getAllAsync<Task>(
        `SELECT t.*, s.name as subject_name, s.color as subject_color 
       FROM tasks t 
       LEFT JOIN subjects s ON t.subject_id = s.id 
       ORDER BY t.is_completed ASC, t.due_date ASC`
    );
};

// 3. Toggle Complete
export const toggleTaskStatus = async (id: number, currentStatus: number): Promise<void> => {
    const db = await getDatabase();
    const newStatus = currentStatus === 1 ? 0 : 1;
    await db.runAsync('UPDATE tasks SET is_completed = ? WHERE id = ?', [newStatus, id]);
};

// 4. Delete Task
export const deleteTask = async (id: number): Promise<void> => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM tasks WHERE id = ?', [id]);
};

// ... existing code ...

// --- CALENDAR OPERATIONS ---

// 1. Get all dates that have attendance marked (for the dots)
export const getCalendarMarkers = async (): Promise<Record<string, any>> => {
    const db = await getDatabase();

    // Get all attendance records joined with subject color
    const results = await db.getAllAsync<{ date: string; color: string; subject_id: number }>(
        `SELECT a.date, s.color, s.id as subject_id 
       FROM attendance a 
       JOIN subjects s ON a.subject_id = s.id`
    );

    const markers: Record<string, any> = {};

    results.forEach(row => {
        if (!markers[row.date]) {
            markers[row.date] = { dots: [] };
        }

        // Avoid duplicate dots for the same subject on the same day
        const exists = markers[row.date].dots.find((d: any) => d.key === row.subject_id);
        if (!exists) {
            markers[row.date].dots.push({
                key: row.subject_id,
                color: row.color,
            });
        }
    });

    return markers;
};

// Note: We will reuse 'getScheduleForDay', 'getExtraClassesForDate', and 'getAttendanceByDate'
// in the screen logic to reconstruct the day.


// --- NOTIFICATION & SETTINGS OPERATIONS ---

// 1. Get Notification Settings
export const getNotificationSettings = async () => {
    const db = await getDatabase();
    return await db.getFirstAsync<{ notify_classes: number; notify_tasks: number }>(
        'SELECT notify_classes, notify_tasks FROM users LIMIT 1'
    );
};

// 2. Update Notification Settings
export const updateNotificationSettings = async (type: 'classes' | 'tasks', value: boolean) => {
    const db = await getDatabase();
    const col = type === 'classes' ? 'notify_classes' : 'notify_tasks';
    const intVal = value ? 1 : 0;
    await db.runAsync(`UPDATE users SET ${col} = ? WHERE id = (SELECT id FROM users LIMIT 1)`, [intVal]);
};

// 3. Save a Notification (for the In-App History)
export const logNotification = async (title: string, body: string, type: string, triggerAt: string) => {
    const db = await getDatabase();
    await db.runAsync(
        'INSERT INTO notifications (title, body, type, trigger_at, is_read) VALUES (?, ?, ?, ?, 0)',
        [title, body, type, triggerAt]
    );
};

// 4. Get "Arrived" Notifications (trigger_at <= NOW)
export const getInboxNotifications = async () => {
    const db = await getDatabase();
    const now = new Date().toISOString();
    return await db.getAllAsync<{ id: number; title: string; body: string; type: string; is_read: number; trigger_at: string }>(
        `SELECT * FROM notifications WHERE trigger_at <= ? ORDER BY trigger_at DESC`,
        [now]
    );
};

// 5. Mark All as Read / Clear
export const clearNotifications = async () => {
    const db = await getDatabase();
    // Option A: Delete them
    await db.runAsync('DELETE FROM notifications');
    // Option B: Just mark read (if you wanted history)
    // await db.runAsync('UPDATE notifications SET is_read = 1');
};

// ... existing code ...

// --- DATA MANAGEMENT ---

// 1. Reset Semester (Delete all academic data, keep User Profile)
export const resetSemesterData = async (): Promise<void> => {
    const db = await getDatabase();
    await db.withExclusiveTransactionAsync(async (txn) => {
        // Delete dependent tables first to avoid Foreign Key conflicts
        await txn.execAsync('DELETE FROM attendance');
        await txn.execAsync('DELETE FROM tasks');
        await txn.execAsync('DELETE FROM extra_classes');
        await txn.execAsync('DELETE FROM timetable');
        await txn.execAsync('DELETE FROM notifications');

        // Finally delete subjects
        await txn.execAsync('DELETE FROM subjects');

        // Optional: Reset SQLite Sequence (IDs start from 1 again)
        await txn.execAsync("DELETE FROM sqlite_sequence WHERE name IN ('subjects', 'tasks', 'attendance', 'extra_classes', 'notifications')");
    });
};

// 2. Get Full Attendance Report (For CSV Export)
export const getFullAttendanceReport = async () => {
    const db = await getDatabase();
    return await db.getAllAsync<{ date: string; subject: string; status: string; type: string }>(
        `SELECT a.date, s.name as subject, a.status, 
       CASE 
          WHEN a.extra_class_id IS NOT NULL THEN 'Extra Class'
          ELSE 'Regular'
       END as type
       FROM attendance a
       JOIN subjects s ON a.subject_id = s.id
       ORDER BY a.date DESC`
    );
};