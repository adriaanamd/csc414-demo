import type { TaskPersistence } from './taskRepository';

const DATABASE_NAME = 'simple-todo';
const DATABASE_VERSION = 1;
const DATABASE_STORE = 'files';
const DATABASE_KEY = 'tasks.sqlite';

export function createIndexedDbPersistence(): TaskPersistence {
  let databasePromise: Promise<IDBDatabase> | undefined;

  function getDatabase(): Promise<IDBDatabase> {
    if (typeof indexedDB === 'undefined') {
      return Promise.reject(
        new Error('This browser does not support local database storage.'),
      );
    }

    if (!databasePromise) {
      databasePromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

        request.onupgradeneeded = () => {
          request.result.createObjectStore(DATABASE_STORE);
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () =>
          reject(
            request.error ??
              new Error('The local task database could not be opened.'),
          );
        request.onblocked = () =>
          reject(new Error('Close another tab using the task list and retry.'));
      });
    }

    return databasePromise;
  }

  return {
    async load() {
      const database = await getDatabase();
      return new Promise((resolve, reject) => {
        const transaction = database.transaction(DATABASE_STORE, 'readonly');
        const request = transaction.objectStore(DATABASE_STORE).get(DATABASE_KEY);

        request.onsuccess = () => {
          const value: unknown = request.result;
          if (value == null) {
            resolve(null);
          } else if (value instanceof Uint8Array) {
            resolve(new Uint8Array(value));
          } else if (value instanceof ArrayBuffer) {
            resolve(new Uint8Array(value));
          } else {
            reject(new Error('The saved task database has an invalid format.'));
          }
        };
        request.onerror = () =>
          reject(
            request.error ??
              new Error('The saved task list could not be read.'),
          );
      });
    },

    async save(databaseFile) {
      const database = await getDatabase();
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(DATABASE_STORE, 'readwrite');
        transaction.objectStore(DATABASE_STORE).put(
          new Uint8Array(databaseFile),
          DATABASE_KEY,
        );
        transaction.oncomplete = () => resolve();
        transaction.onerror = () =>
          reject(
            transaction.error ??
              new Error('The task list could not be saved on this device.'),
          );
        transaction.onabort = () =>
          reject(
            transaction.error ??
              new Error('Saving the task list was interrupted.'),
          );
      });
    },
  };
}
