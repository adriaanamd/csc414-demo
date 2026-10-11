import { beforeAll, describe, expect, it } from 'vitest';
import initializeSqlJs, { type Database, type SqlJsStatic } from 'sql.js';
import {
  createTaskRepository,
  type TaskPersistence,
} from '@/lib/taskRepository';

let sql: SqlJsStatic;

beforeAll(async () => {
  sql = await initializeSqlJs();
});

function createMemoryPersistence(): TaskPersistence & {
  getSavedFile(): Uint8Array | null;
} {
  let databaseFile: Uint8Array | null = null;

  return {
    async load() {
      return databaseFile ? new Uint8Array(databaseFile) : null;
    },
    async save(file) {
      databaseFile = new Uint8Array(file);
    },
    getSavedFile() {
      return databaseFile ? new Uint8Array(databaseFile) : null;
    },
  };
}

function makeRepository(persistence: TaskPersistence) {
  let nextId = 0;

  return createTaskRepository({
    openDatabase: async (file): Promise<Database> =>
      new sql.Database(file ?? undefined),
    persistence,
    createId: () => `task-${++nextId}`,
    now: () => 1_700_000_000_000 + nextId,
  });
}

describe('SQLite task repository', () => {
  it('adds trimmed tasks and saves a readable SQLite file', async () => {
    const persistence = createMemoryPersistence();
    const repository = makeRepository(persistence);

    const task = await repository.add('  Buy groceries  ');

    expect(task).toMatchObject({
      id: 'task-1',
      title: 'Buy groceries',
      completed: false,
    });
    expect(await repository.list()).toEqual([task]);
    expect(persistence.getSavedFile()?.byteLength).toBeGreaterThan(0);
  });

  it('restores data from the saved SQLite file and toggles completion', async () => {
    const persistence = createMemoryPersistence();
    const firstRepository = makeRepository(persistence);
    const task = await firstRepository.add('Call Sam');

    const reopenedRepository = makeRepository(persistence);
    await reopenedRepository.toggle(task.id);
    await expect(reopenedRepository.list()).resolves.toEqual([
      { ...task, completed: true },
    ]);
  });

  it('removes individual tasks and clears only completed tasks', async () => {
    const repository = makeRepository(createMemoryPersistence());
    const finished = await repository.add('Finished');
    const inProgress = await repository.add('Still doing');
    await repository.toggle(finished.id);

    await repository.clearCompleted();
    expect(await repository.list()).toEqual([inProgress]);

    await repository.remove(inProgress.id);
    expect(await repository.list()).toEqual([]);
  });

  it('rejects blank task names', async () => {
    const repository = makeRepository(createMemoryPersistence());

    await expect(repository.add('   ')).rejects.toThrow(
      'Enter a task before adding it.',
    );
  });

  it('rejects an exact duplicate and keeps the original task', async () => {
    const repository = makeRepository(createMemoryPersistence());
    const original = await repository.add('Buy groceries');

    await expect(repository.add('Buy groceries')).rejects.toThrow(
      'A task with this name already exists.',
    );
    await expect(repository.list()).resolves.toEqual([original]);
  });

  it('rejects duplicates that differ only by capitalization and surrounding whitespace', async () => {
    const repository = makeRepository(createMemoryPersistence());
    const original = await repository.add('Buy groceries');

    await expect(repository.add('  buy GROCERIES  ')).rejects.toThrow(
      'A task with this name already exists.',
    );
    await expect(repository.list()).resolves.toEqual([original]);
  });
});
