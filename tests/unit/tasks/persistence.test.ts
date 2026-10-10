import { describe, expect, it } from 'vitest';
import type { TaskPersistence } from '@/lib/taskRepository';

describe('Task persistence layer contract', () => {
  it('handles empty initial state and binary data round-trip', async () => {
    let saved: Uint8Array | null = null;
    const memoryPersistence: TaskPersistence = {
      async load() {
        return saved;
      },
      async save(file: Uint8Array) {
        saved = new Uint8Array(file);
      },
    };

    // Initially empty
    expect(await memoryPersistence.load()).toBeNull();

    // Save binary data
    const sampleData = new Uint8Array([0x53, 0x51, 0x4c, 0x69, 0x74, 0x65]);
    await memoryPersistence.save(sampleData);

    const loaded = await memoryPersistence.load();
    expect(loaded).not.toBeNull();
    expect(loaded).toEqual(sampleData);
  });

  it('preserves binary data integrity across multiple writes', async () => {
    let stored: Uint8Array | null = null;
    const persistence: TaskPersistence = {
      async load() {
        return stored ? new Uint8Array(stored) : null;
      },
      async save(file: Uint8Array) {
        stored = new Uint8Array(file);
      },
    };

    const first = new Uint8Array([1, 2, 3]);
    await persistence.save(first);
    expect(await persistence.load()).toEqual(first);

    const second = new Uint8Array([4, 5, 6, 7, 8]);
    await persistence.save(second);
    expect(await persistence.load()).toEqual(second);
  });
});
