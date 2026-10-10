import type { Database } from 'sql.js';

export type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
};

export interface TaskPersistence {
  load(): Promise<Uint8Array | null>;
  save(databaseFile: Uint8Array): Promise<void>;
}

export interface TaskRepository {
  list(): Promise<Task[]>;
  add(title: string): Promise<Task>;
  toggle(id: string): Promise<void>;
  remove(id: string): Promise<void>;
  clearCompleted(): Promise<void>;
}

type TaskRepositoryOptions = {
  openDatabase: (databaseFile: Uint8Array | null) => Promise<Database>;
  persistence: TaskPersistence;
  createId?: () => string;
  now?: () => number;
};

export function createTaskRepository({
  openDatabase,
  persistence,
  createId = () => globalThis.crypto.randomUUID(),
  now = () => Date.now(),
}: TaskRepositoryOptions): TaskRepository {
  let databasePromise: Promise<Database> | undefined;

  async function getDatabase(): Promise<Database> {
    if (!databasePromise) {
      databasePromise = (async () => {
        const storedFile = await persistence.load();
        const database = await openDatabase(storedFile);
        database.run(`
          CREATE TABLE IF NOT EXISTS tasks (
            id TEXT PRIMARY KEY NOT NULL,
            title TEXT NOT NULL,
            completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
            created_at INTEGER NOT NULL
          )
        `);
        if (!storedFile) {
          await persistence.save(new Uint8Array(database.export()));
        }
        return database;
      })();
    }

    return databasePromise;
  }

  async function persist(database: Database): Promise<void> {
    await persistence.save(new Uint8Array(database.export()));
  }

  return {
    async list() {
      const database = await getDatabase();
      const statement = database.prepare(
        'SELECT id, title, completed, created_at FROM tasks ORDER BY created_at DESC, rowid DESC',
      );
      const tasks: Task[] = [];

      try {
        while (statement.step()) {
          const row = statement.getAsObject() as {
            id: string;
            title: string;
            completed: number;
            created_at: number;
          };
          tasks.push({
            id: row.id,
            title: row.title,
            completed: row.completed === 1,
            createdAt: row.created_at,
          });
        }
      } finally {
        statement.free();
      }

      return tasks;
    },

    async add(title) {
      const normalizedTitle = title.trim();
      if (!normalizedTitle) {
        throw new Error('Enter a task before adding it.');
      }
      if (normalizedTitle.length > 180) {
        throw new Error('Tasks must be 180 characters or fewer.');
      }

      const database = await getDatabase();
      const task: Task = {
        id: createId(),
        title: normalizedTitle,
        completed: false,
        createdAt: now(),
      };

      database.run(
        'INSERT INTO tasks (id, title, completed, created_at) VALUES (?, ?, 0, ?)',
        [task.id, task.title, task.createdAt],
      );
      await persist(database);
      return task;
    },

    async toggle(id) {
      const database = await getDatabase();
      database.run(
        'UPDATE tasks SET completed = CASE completed WHEN 0 THEN 1 ELSE 0 END WHERE id = ?',
        [id],
      );
      if (database.getRowsModified() === 0) {
        throw new Error('That task could not be found.');
      }
      await persist(database);
    },

    async remove(id) {
      const database = await getDatabase();
      database.run('DELETE FROM tasks WHERE id = ?', [id]);
      if (database.getRowsModified() === 0) {
        throw new Error('That task could not be found.');
      }
      await persist(database);
    },

    async clearCompleted() {
      const database = await getDatabase();
      database.run('DELETE FROM tasks WHERE completed = 1');
      await persist(database);
    },
  };
}
