/** @vitest-environment jsdom */
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import TodoWorkspace, { type TodoTask } from '@/components/TodoWorkspace';

// Interactive wrapper mimicking the full Landing Page stateful container
function LandingFlowContainer(props: { initialError?: string | null }) {
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [error, setError] = useState<string | null>(props.initialError ?? null);

  return (
    <TodoWorkspace
      tasks={tasks}
      isLoading={false}
      error={error}
      onAddTask={(title) => {
        setError(null);
        setTasks((prev) => [
          ...prev,
          { id: `task-${Date.now()}`, title, completed: false, createdAt: Date.now() },
        ]);
      }}
      onToggleTask={(id) => {
        setTasks((prev) =>
          prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)),
        );
      }}
      onDeleteTask={(id) => {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }}
      onClearCompleted={() => {
        setTasks((prev) => prev.filter((t) => !t.completed));
      }}
    />
  );
}

describe('Landing Page End-to-End Workflow', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.dataset.theme = 'light';
  });

  it('completes the full landing page theme and filter journey', () => {
    render(<LandingFlowContainer />);

    // 1. Initial view: verify landing branding and default empty state
    expect(screen.getByRole('heading', { level: 1, name: /Simple To-Do/i })).toBeInTheDocument();
    expect(screen.getByTestId('empty-state')).toHaveTextContent('A little space to begin.');

    // 2. Theme switching workflow: toggle theme and check document and storage updates
    const themeBtn = screen.getByTestId('button-toggle-theme');
    fireEvent.click(themeBtn);

    const storedTheme = window.localStorage.getItem('simple-todo-theme');
    expect(storedTheme).toBe('dark');
    expect(document.documentElement.dataset.theme).toBe('dark');

    // Toggle back
    fireEvent.click(themeBtn);
    expect(window.localStorage.getItem('simple-todo-theme')).toBe('light');
    expect(document.documentElement.dataset.theme).toBe('light');

    // 3. Tab switching workflow: each tab presents context-aware empty state
    fireEvent.click(screen.getByTestId('filter-active'));
    expect(screen.getByTestId('empty-state')).toHaveTextContent('You’re all caught up.');

    fireEvent.click(screen.getByTestId('filter-completed'));
    expect(screen.getByTestId('empty-state')).toHaveTextContent('Nothing checked off yet.');

    fireEvent.click(screen.getByTestId('filter-all'));
    expect(screen.getByTestId('empty-state')).toHaveTextContent('A little space to begin.');
  });

  it('recovers from error state when a user adds a task', () => {
    render(<LandingFlowContainer initialError="Failed to load tasks" />);

    expect(screen.getByTestId('status-error')).toHaveTextContent('Failed to load tasks');

    // User enters a task, resolving the error state
    const input = screen.getByTestId('input-new-task');
    fireEvent.change(input, { target: { value: 'Buy groceries' } });
    fireEvent.submit(screen.getByTestId('form-add-task'));

    // Error banner is cleared and task appears
    expect(screen.queryByTestId('status-error')).not.toBeInTheDocument();
    expect(screen.getByText('Buy groceries')).toBeInTheDocument();
  });
});
