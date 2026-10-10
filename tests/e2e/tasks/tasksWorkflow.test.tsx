/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { useState } from 'react';
import TodoWorkspace, { type TodoTask } from '@/components/TodoWorkspace';

// Full stateful task manager container simulating user session
function StatefulTaskManager() {
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  let [counter, setCounter] = useState(0);

  return (
    <TodoWorkspace
      tasks={tasks}
      isLoading={false}
      error={null}
      onAddTask={(title) => {
        const nextId = String(counter + 1);
        setCounter((c) => c + 1);
        setTasks((prev) => [
          ...prev,
          { id: nextId, title, completed: false, createdAt: Date.now() },
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

describe('Tasks End-to-End Workflow', () => {
  it('manages the complete task lifecycle from creation to completion, filtering, and cleanup', () => {
    render(<StatefulTaskManager />);

    const input = screen.getByTestId('input-new-task');
    const form = screen.getByTestId('form-add-task');

    // 1. User adds three tasks
    fireEvent.change(input, { target: { value: 'Plan trip' } });
    fireEvent.submit(form);

    fireEvent.change(input, { target: { value: 'Pack bags' } });
    fireEvent.submit(form);

    fireEvent.change(input, { target: { value: 'Book flight' } });
    fireEvent.submit(form);

    expect(screen.getByText('Plan trip')).toBeInTheDocument();
    expect(screen.getByText('Pack bags')).toBeInTheDocument();
    expect(screen.getByText('Book flight')).toBeInTheDocument();
    expect(screen.getByTestId('text-task-summary')).toHaveTextContent('3 left');

    // 2. User marks "Plan trip" as completed
    const planTripRow = screen.getByText('Plan trip').closest('li');
    expect(planTripRow).not.toBeNull();
    const planTripCheck = planTripRow!.querySelector('button[role="checkbox"]');
    expect(planTripCheck).not.toBeNull();
    fireEvent.click(planTripCheck!);

    // Summary updates
    expect(screen.getByTestId('text-task-summary')).toHaveTextContent('2 left');
    expect(screen.getByTestId('text-footer-count')).toHaveTextContent('1 of 3 tasks finished');

    // "Clear completed" button appears
    const clearCompletedBtn = screen.getByTestId('button-clear-completed');
    expect(clearCompletedBtn).toBeInTheDocument();

    // 3. User tests filtering: To do vs Done vs All
    fireEvent.click(screen.getByTestId('filter-active'));
    expect(screen.queryByText('Plan trip')).not.toBeInTheDocument();
    expect(screen.getByText('Pack bags')).toBeInTheDocument();
    expect(screen.getByText('Book flight')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('filter-completed'));
    expect(screen.getByText('Plan trip')).toBeInTheDocument();
    expect(screen.queryByText('Pack bags')).not.toBeInTheDocument();
    expect(screen.queryByText('Book flight')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('filter-all'));
    expect(screen.getByText('Plan trip')).toBeInTheDocument();
    expect(screen.getByText('Pack bags')).toBeInTheDocument();
    expect(screen.getByText('Book flight')).toBeInTheDocument();

    // 4. User clears completed tasks
    fireEvent.click(clearCompletedBtn);
    expect(screen.queryByText('Plan trip')).not.toBeInTheDocument();
    expect(screen.getByText('Pack bags')).toBeInTheDocument();
    expect(screen.getByText('Book flight')).toBeInTheDocument();
    expect(screen.queryByTestId('button-clear-completed')).not.toBeInTheDocument();

    // 5. User deletes remaining tasks
    const packBagsRow = screen.getByText('Pack bags').closest('li');
    const packDeleteBtn = packBagsRow!.querySelector('button.todo-delete');
    fireEvent.click(packDeleteBtn!);
    expect(screen.queryByText('Pack bags')).not.toBeInTheDocument();

    const bookFlightRow = screen.getByText('Book flight').closest('li');
    const bookDeleteBtn = bookFlightRow!.querySelector('button.todo-delete');
    fireEvent.click(bookDeleteBtn!);
    expect(screen.queryByText('Book flight')).not.toBeInTheDocument();

    // 6. List is empty, empty state reappears
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
  });
});
