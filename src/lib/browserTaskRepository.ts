import { createIndexedDbPersistence } from './indexedDbPersistence';
import { createTaskRepository } from './taskRepository';

export function createBrowserTaskRepository() {
  return createTaskRepository({
    persistence: createIndexedDbPersistence(),
    openDatabase: async (databaseFile) => {
      const [{ default: initializeSqlJs }, { default: wasmUrl }] =
        await Promise.all([
          import('sql.js'),
          import('sql.js/dist/sql-wasm.wasm?url'),
        ]);
      const SQL = await initializeSqlJs({
        locateFile: () => wasmUrl,
      });
      return new SQL.Database(databaseFile ?? undefined);
    },
  });
}
