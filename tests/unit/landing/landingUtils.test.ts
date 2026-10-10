import { describe, expect, it } from 'vitest';
import type { TodoTask } from '@/components/TodoWorkspace';

// Helper mimicking landing page filtering logic
function filterTasks(tasks: TodoTask[], filter: 'all' | 'active' | 'completed'): TodoTask[] {
  if (filter === 'active') return tasks.filter((task) => !task.completed);
  if (filter === 'completed') return tasks.filter((task) => task.completed);
  return tasks;
}

// Helper mimicking landing page empty state copy resolution
function getEmptyCopy(filter: 'all' | 'active' | 'completed') {
  if (filter === 'completed') {
    return { title: 'Nothing checked off yet.', detail: 'The finished things will gather here.' };
  }
  if (filter === 'active') {
    return { title: 'You’re all caught up.', detail: 'A little breathing room. Add something when it comes to mind.' };
  }
  return { title: 'A little space to begin.', detail: 'Add a task above. You can figure out the rest as you go.' };
}

// Helper mimicking theme calculation logic
function resolveTheme(preference: 'system' | 'light' | 'dark', systemPrefersDark: boolean): 'dark' | 'light' {
  if (preference === 'dark') return 'dark';
  if (preference === 'light') return 'light';
  return systemPrefersDark ? 'dark' : 'light';
}

// Helper mimicking route error message formatter
function formatErrorMessage(cause: unknown): string {
  return cause instanceof Error
    ? cause.message
    : 'Your local task list could not be saved. Please try again.';
}

describe('Landing page unit utilities', () => {
  const sampleTasks: TodoTask[] = [
    { id: '1', title: 'Task A', completed: false, createdAt: 100 },
    { id: '2', title: 'Task B', completed: true, createdAt: 200 },
    { id: '3', title: 'Task C', completed: false, createdAt: 300 },
  ];

  describe('Task filtering & counts', () => {
    it('returns all tasks when filter is "all"', () => {
      expect(filterTasks(sampleTasks, 'all')).toHaveLength(3);
    });

    it('returns only uncompleted tasks when filter is "active"', () => {
      const active = filterTasks(sampleTasks, 'active');
      expect(active).toHaveLength(2);
      expect(active.every((t) => !t.completed)).toBe(true);
    });

    it('returns only completed tasks when filter is "completed"', () => {
      const completed = filterTasks(sampleTasks, 'completed');
      expect(completed).toHaveLength(1);
      expect(completed[0].id).toBe('2');
    });
  });

  describe('Empty state copy resolution', () => {
    it('provides distinct empty state messages per filter', () => {
      expect(getEmptyCopy('all').title).toBe('A little space to begin.');
      expect(getEmptyCopy('active').title).toBe('You’re all caught up.');
      expect(getEmptyCopy('completed').title).toBe('Nothing checked off yet.');
    });
  });

  describe('Theme resolution', () => {
    it('respects explicit light preference', () => {
      expect(resolveTheme('light', true)).toBe('light');
      expect(resolveTheme('light', false)).toBe('light');
    });

    it('respects explicit dark preference', () => {
      expect(resolveTheme('dark', false)).toBe('dark');
      expect(resolveTheme('dark', true)).toBe('dark');
    });

    it('defers to system preference when set to "system"', () => {
      expect(resolveTheme('system', true)).toBe('dark');
      expect(resolveTheme('system', false)).toBe('light');
    });
  });

  describe('Error message formatting', () => {
    it('extracts Error message when cause is an Error instance', () => {
      expect(formatErrorMessage(new Error('Network error'))).toBe('Network error');
    });

    it('returns fallback message for unknown causes', () => {
      expect(formatErrorMessage('some string')).toBe(
        'Your local task list could not be saved. Please try again.',
      );
      expect(formatErrorMessage(null)).toBe(
        'Your local task list could not be saved. Please try again.',
      );
    });
  });
});
